import { observer } from "mobx-react-lite";
import { model as baseModel } from "@/models/Model";
import { io as socket } from "socket.io-client";
import { useEffect, useState, useRef, use } from "react";
import toast from "react-hot-toast";
import Tuna from "tunajs";
import { roleFrequencyToFrequency } from "@/utils/responseConverter";
import Peer from "simple-peer";
import { log } from "console";
import { v4 as uuidv4 } from "uuid";
import micGain from "./ConfigMenu";
import setMicGain from "./ConfigMenu";
import ConfigMenu from "./ConfigMenu";
import { PTTProvider, usePTT } from "../contexts/PTTContext";
import { Call } from "@/types";

interface Props {
  model: typeof baseModel;
}

const p2pToTrack = new Map<[string, string], MediaStreamTrack>();

const SocketHandler = observer((props: Props) => {
  const { model } = props;
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [pttGainNode, setPttGainNode] = useState<GainNode | null>(null);
  const { pttActive } = usePTT();

  useEffect(() => {
    if (stream !== null) return;

    if (navigator.mediaDevices === undefined) {
      toast("Media devices not supported", { icon: "❌" });
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: {
          autoGainControl: false,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44000,
          sampleSize: 16,
        },
      })
      .then((stream) => {
        console.log("Got stream", stream); //kommer hit

        const audioContext = new AudioContext();
        const mediaStreamSource = audioContext.createMediaStreamSource(stream);
        const mediaStreamDestination =
          audioContext.createMediaStreamDestination();

        let tuna = new Tuna(audioContext);

        const masterGainNode = audioContext.createGain();
        masterGainNode.gain.value = model.micGain / 50;
        //gainNode.gain.value = model.micGain/50;

        // low pass filter for radio effect
        const lowpassFilter = new tuna.Filter({
          frequency: 2300,
          Q: 80,
          gain: 0,
          filterType: "lowpass",
          bypass: false,
        });

        // high pass filter for radio effect
        const highpassFilter = new tuna.Filter({
          frequency: 200,
          Q: 80,
          gain: 0,
          filterType: "highpass",
          bypass: false,
        });

        //Compressing the voice
        const compressor = new tuna.Compressor({
          threshold: -30,
          makeupGain: 1,
          attack: 5,
          release: 200,
          ratio: 10,
          knee: 5,
          automakeup: true,
          bypass: false,
        });

        // overdrive giving audio distortion for radio effect
        const overdrive = new tuna.Overdrive({
          outputGain: 0,
          drive: 0.2,
          curveAmount: 0.3,
          algorithmIndex: 2,
          bypass: false,
        });

        //Generating some whitenoise to mix in with the mic input
        const bufferSize = 2 * audioContext.sampleRate;
        const whiteNoiseBuffer = audioContext.createBuffer(
          1,
          bufferSize,
          audioContext.sampleRate
        );
        const data = whiteNoiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const whiteNoiseSource = audioContext.createBufferSource();
        whiteNoiseSource.buffer = whiteNoiseBuffer;
        whiteNoiseSource.loop = true;
        whiteNoiseSource.start();

        //gain of white noise
        const noiseGain = audioContext.createGain();
        noiseGain.gain.value = 0.05;

        // push to talk gain
        const pttGain = audioContext.createGain();
        pttGain.gain.value = 0;

        // connect chain for whitenoise
        whiteNoiseSource.connect(noiseGain);
        noiseGain.connect(masterGainNode);

        // connect chain for radio effect
        mediaStreamSource.connect(lowpassFilter);
        lowpassFilter.connect(highpassFilter);
        highpassFilter.connect(compressor);
        compressor.connect(overdrive);
        overdrive.connect(masterGainNode);

        // Gain for push to talk
        masterGainNode.connect(pttGain);
        pttGain.connect(mediaStreamDestination);

        setStream(mediaStreamDestination.stream);
        setGainNode(masterGainNode);
        setPttGainNode(pttGain);
      });
  }, []);

  //Push to talk logic
  useEffect(() => {
    if (!pttGainNode) return;

    try {
      console.log(model.txState);
      pttGainNode.gain.value = pttActive && model.txState ? 1 : 0;
    } catch (error) {
      console.log("Push to talk error: " + error);
    }
  }, [pttActive, pttGainNode, model.txState]);

  //Microphone gain logic
  useEffect(() => {
    if (!gainNode) return;

    try {
      gainNode.gain.value = model.micGain / 50;
      console.log("Mic gain: " + model.micGain);
    } catch (error) {
      console.log("Mic gain error: " + error);
    }
  }, [model.micGain, gainNode]);

  useEffect(() => {
    if (!stream) {
      return;
    } else {
      console.log("Stream in socket handler", stream);
    }

    const io = socket(
      window.location.hostname + (model.devMode === true ? ":8080" : "")
    );
    io.on("connect", () => {
      toast("Connected to socket server", { icon: "🚀" });
      model.socket.io = io;
      model.socket.connected = true;
      console.log("connected to socket server");
    });

    io.on("IncomingCall", (data: any) => {
      if (data.error) {
        return toast.error("Error: " + data.error);
      }
      console.log("Incoming call", data);

      if (
        model.pendingCalls.find((call) => call.initiator === data.initiator)
      ) {
        console.log("Call already exists");

        return;
      }

      if (model.selectedRoles.includes(data.receiverRole)) {
        data.receiver = io.id;
        model.pendingCalls = model.pendingCalls.concat([data as Call]);
      }
    });

    io.on("endICCall", (data) => {
      console.log("Call ended", data);

      model.acceptedCalls = model.acceptedCalls.filter((call) => {
        if (call.id != data.id) {
          return true;
        }
        return false;
      });
    });

    io.on("ICCallAccepted", (call: Call) => {
      console.log("IC call accepted", call);
      toast.success("Call accepted from " + call.initiatorRole);
      model.acceptedCalls = model.acceptedCalls.concat([call]);
    });

    io.on("tryDisconnectPeer", (user: string) => {
      console.log("try disconnect peer", user);

      const peer = model.peers.get(user);
      if (!peer) {
        return;
      }
      peer.destroy();
      model.peers.delete(user);
    });

    io.on("tryConnectPeer", (user: string) => {
      const peerExists = model.peers.get(user);

      if (peerExists && !peerExists.destroyed) {
        console.log("peer exists already");
        return;
      }

      if (peerExists?.connected) {
        console.log("already connected");
        return;
      }

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream ?? undefined,
        sdpTransform(sdp) {
          return sdp.replace(
            "a=fmtp:111 minptime=10;useinbandfec=1",
            "a=fmtp:111 ptime=5;useinbandfec=1;stereo=1;maxplaybackrate=48000;maxaveragebitrat=128000;sprop-stereo=1"
          );
        },

        config: {
          iceServers: [
            {
              urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
              ],
            },
          ],
          iceCandidatePoolSize: 10,
        },
      });
      console.log("Peer has connected");
      console.log("PEER CONNECT TRACKS " + stream.getTracks().length);

      peer.on("signal", (offerSignal) => {
        console.log("initiator sending offer signal");
        io.emit("callUser", {
          userToCall: user,
          signalData: offerSignal,
          from: io.id,
        });
        model.peers.set(user, peer);
      });
    });

    io.on("callAccepted", (signal: any) => {
      console.log("call accepted", signal);

      const peer = model.peers.get(signal.from);
      if (!peer) {
        return;
      }

      peer.signal(signal.signal);
    });

    io.on("getCurrentXC", (data: any) => {
      if (data.error) {
        return toast.error("error getting XC: " + data.error);
      }
      console.log("got XC", data);

      model.XCFrequencies = data;
    });

    io.on("createXC", (data: any) => {
      if (data.error) {
        return toast.error("error creating XC: " + data.error);
      }
      console.log("XC created", data);

      model.XCFrequencies = model.XCFrequencies.concat([data]);
    });

    io.on("deleteXC", (data: any) => {
      if (data.error) {
        return toast.error("error deleting XC: " + data.error);
      }
      console.log("XC deleted", data);

      model.XCFrequencies = model.XCFrequencies.filter((xc) => {
        if (xc.id !== data.id) {
          return true;
        }
        return false;
      });
    });

    io.on("updateXC", (data: any) => {
      if (data.error) {
        return toast.error("error updating XC: " + data.error);
      }
      console.log("XC updated", data);

      model.XCFrequencies = model.XCFrequencies.map((xc) => {
        if (xc.id === data.id) {
          return data;
        }
        return xc;
      });
    });

    io.on("hey", (data: any) => {
      console.log("Stream in hey", stream);

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream ?? undefined,
        sdpTransform(sdp) {
          return sdp.replace(
            "a=fmtp:111 minptime=10;useinbandfec=1",
            "a=fmtp:111 ptime=5;useinbandfec=1;stereo=1;maxplaybackrate=48000;maxaveragebitrat=128000;sprop-stereo=1"
          );
        },
        config: {
          iceServers: [
            {
              urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
              ],
            },
          ],
          iceCandidatePoolSize: 10,
        },
      });

      console.log("hey", data.from);

      peer.on("signal", (answerSignal: any, freq: string) => {
        console.log("Acceptcall and will emit signal", answerSignal);
        io.emit("acceptCall", {
          signal: answerSignal,
          to: data.from,
          from: io.id,
        });
      });

      peer.signal(data.signal);

      model.peers.set(data.from, peer);
    });

    io.on("addRole", (data: any) => {
      if (data.error) {
        return toast.error("error getting new role: " + data.error);
      }
      if (!model.configuration) return;
      data["frequencies"] = [];
      console.log("role added", data);

      model.configuration.roles = model.configuration.roles.concat([data]);
    });

    io.on("deleteRole", (data: any) => {
      if (data.error) {
        return toast.error("error getting deleting role: " + data.error);
      }
      if (!model.configuration) return;
      console.log("role deleted", data);

      model.configuration.roles = model.configuration.roles.filter((role) => {
        if (role.id !== data.id) {
          return true;
        }
        model.selectedRoles = model.selectedRoles.filter(
          (r) => r !== role.name
        );

        return false;
      });
    });

    io.on("editRole", (data: any) => {
      if (data.error) {
        return toast.error("error getting new role: " + data.error);
      }
      if (!model.configuration) return;
      console.log("role added", data);

      model.configuration.roles = model.configuration.roles.map((role) => {
        if (role.id === data.id) {
          model.selectedRoles = model.selectedRoles.map((roleName) => {
            if (roleName === role.name) {
              return data.name;
            }
            return roleName;
          });
          return { ...role, ...data };
        }
        return role;
      });
    });

    io.on("addRoleFrequency", (data: any) => {
      if (data.error) {
        return toast.error("error adding frequency: " + data.error);
      }
      if (!model.configuration) return;
      console.log("frequency added", data);

      model.configuration.roles = model.configuration.roles.map((role) => {
        if (role.id === data.roleId) {
          data.id = data.frequency.id;
          data.frequency = data.frequency.frequency;

          const obj = {
            ...role,
            frequencies: role.frequencies.concat([data]),
          };
          console.log("success", obj);

          return obj;
        }
        return role;
      });
      console.log("new roles", model.configuration.roles);
    });

    io.on("editFrequency", (data: any) => {
      if (data.error) {
        return toast.error("error edit frequency: " + data.error);
      }
      if (!model.configuration) return;

      model.configuration.roles = model.configuration.roles.map((role) => {
        role.frequencies = role.frequencies.map((f) => {
          if (f.id === data.id) {
            return data;
          }
          return f;
        });
        return role;
      });
    });

    io.on("deleteRoleFrequency", (data: any) => {
      if (data.error) {
        return toast.error("error deleting frequency: " + data.error);
      }
      if (!model.configuration) return;
      console.log("frequency removed", data);

      model.configuration.roles = model.configuration.roles.map((role) => {
        if (role.id === data.roleId) {
          role.frequencies = role.frequencies.filter(
            (f) => f.id !== data.frequencyId
          );
          return role;
        }
        return role;
      });
    });

    io.on("editfrequency", (data: any) => {
      if (data.error) {
        return toast.error("error editing frequency: " + data.error);
      }
      if (!model.configuration) return;
    });

    io.on("setActiveConfig", (data: any) => {
      if (data.error) {
        return toast.error("error setting active config: " + data.error);
      }
      window.location.reload();
    });

    io.on("getCurrentConfig", (config: any) => {
      if (config.error) {
        return toast(config.error, { icon: "❌" });
      }
      toast("Got current config", { icon: "📡" });

      try {
        config.roles.map((role: any) => {
          const frequencies = roleFrequencyToFrequency(role["roleFrequency"]);
          role.frequencies = frequencies;
        });
        model.configuration = config;
      } catch (error) {
        toast("Error parsing configuration", { icon: "❌" });
      }
    });

    io.on("disconnect", () => {
      console.log("disconnected from socket server");
    });

    return () => {
      io.disconnect();
    };
  }, [stream]);

  return <></>;
});

export default SocketHandler;
