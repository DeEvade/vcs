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
import CommunicationsHandler from "./CommuncationsHandler";

interface Props {
  model: typeof baseModel;
}

//TODO Stängav mic check när configmeny stängs!

const SocketHandler = observer((props: Props) => {
  const { model } = props;
  const [analyserStream, setAnalyserStream] = useState<MediaStream | null>(
    null
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gainNodeMic, setGainNodeMic] = useState<GainNode | null>(null);
  const [gainNodeNoise, setGainNodeNoise] = useState<GainNode | null>(null);
  const [pttGainNodeMic, setPttGainNodeMic] = useState<GainNode | null>(null);
  const [pttGainNodeNoise, setPttGainNodeNoise] = useState<GainNode | null>(
    null
  );
  const { pttActive } = usePTT();
  const [micLevel, setMicLevel] = useState<number>(0);

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
          autoGainControl: true,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44000,
          sampleSize: 16,
        },
      })
      .then((stream) => {
        console.log("Got stream", stream);

        const audioContext = new AudioContext();
        const mediaStreamSource = audioContext.createMediaStreamSource(stream);
        const mediaStreamDestinationMic =
          audioContext.createMediaStreamDestination();
        const mediaStreamDestinationNoise =
          audioContext.createMediaStreamDestination();
        const mediaStreamDestinationAnalyser =
          audioContext.createMediaStreamDestination();

        let tuna = new Tuna(audioContext);

        const masterGainNodeMic = audioContext.createGain();
        masterGainNodeMic.gain.value = model.micGain / 50;
        const masterGainNodeNoise = audioContext.createGain();
        masterGainNodeMic.gain.value = model.micGain / 50;

        //gainNode.gain.value = model.micGain/50;
        const preNoiseMaster = audioContext.createGain();
        preNoiseMaster.gain.value = model.micGain / 50;

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
        const pttGainMic = audioContext.createGain();
        pttGainMic.gain.value = 0;

        const pttGainNoise = audioContext.createGain();
        pttGainNoise.gain.value = 0;

        // connect chain for whitenoise
        whiteNoiseSource.connect(noiseGain);
        noiseGain.connect(masterGainNodeNoise);

        // connect chain for radio effect
        mediaStreamSource.connect(lowpassFilter);
        lowpassFilter.connect(highpassFilter);
        highpassFilter.connect(compressor);
        compressor.connect(overdrive);
        overdrive.connect(preNoiseMaster);
        preNoiseMaster.connect(masterGainNodeMic);

        // Gain for push to talk
        masterGainNodeMic.connect(pttGainMic);
        masterGainNodeMic.connect(mediaStreamDestinationAnalyser);
        setAnalyserStream(mediaStreamDestinationAnalyser.stream);
        pttGainMic.connect(mediaStreamDestinationMic);

        masterGainNodeNoise.connect(pttGainNoise);
        pttGainNoise.connect(mediaStreamDestinationNoise);

        stream.addTrack(mediaStreamDestinationNoise.stream.getTracks()[0]);
        stream.addTrack(mediaStreamDestinationMic.stream.getTracks()[0]);

        stream.removeTrack(stream.getTracks()[0]);

        setStream(stream);
        setGainNodeMic(masterGainNodeMic);
        setGainNodeNoise(masterGainNodeNoise);
        setPttGainNodeMic(pttGainMic);
        setPttGainNodeNoise(pttGainNoise);
      });
  }, []);

  // Audio Analyser
  useEffect(() => {
    const audioLevel = () => {
      if (!analyserStream || !stream) return;

      const micStream = new MediaStream();
      micStream.addTrack(analyserStream.getTracks()[0]);
      const audioContext = new AudioContext();
      const mediaStreamSource = audioContext.createMediaStreamSource(micStream);

      const outputDestination = audioContext.createMediaStreamDestination();
      mediaStreamSource.connect(outputDestination);

      outputDestination.stream.getAudioTracks().forEach((track) => {
        track.enabled = true; // Enable the track to hear the microphone input
      });

      const analyser = audioContext.createAnalyser();
      mediaStreamSource.connect(analyser);

      analyser.fftSize = 1024;

      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        if (!model.analyserActive) return;
        model.analyserVolume = average * 1.5;
      };

      const interval = setInterval(updateAudioLevel, 50);

      return () => clearInterval(interval);
    };
    if (model.analyserActive) {
      audioLevel();
    }
  }, [model.analyserActive]);

  //Push to talk logic
  useEffect(() => {
    if (!pttGainNodeMic || !pttGainNodeNoise) return;

    try {
      const entries = Array.from(model.freqToMediaStream.entries());
      pttGainNodeMic.gain.value =
        pttActive && model.txState && !model.analyserActive ? 1 : 0;
      pttGainNodeNoise.gain.value =
        pttActive && model.txState && !model.analyserActive ? 1 : 0;
    } catch (error) {
      console.log("Push to talk error: " + error);
    }
  }, [pttActive, pttGainNodeMic, pttGainNodeNoise, model.txState]);

  //Microphone gain logic
  useEffect(() => {
    if (!gainNodeMic || !gainNodeNoise) return;

    try {
      gainNodeMic.gain.value = model.micGain / 50;
      gainNodeNoise.gain.value = model.micGain / 50;
      console.log("Mic gain: " + model.micGain);
    } catch (error) {
      console.log("Mic gain error: " + error);
    }
  }, [model.micGain, gainNodeMic, gainNodeNoise]);

  // TX handling
  // Enables or disables mediastream according to TX states
  useEffect(() => {
    const entries = Array.from(model.freqToMediaStream.entries());
    console.log("Currently turned on TX: " + model.TXFrequencies);
    for (const [key, mediaStream] of entries) {
      if (!model.TXFrequencies.includes(key)) {
        console.log("Disabling: " + key);
        mediaStream.getTracks().forEach((track) => {
          track.enabled = false;
        });
        // mediaStream.getTracks()[0].enabled = false;
      } else {
        console.log("Enabling: " + key);
        mediaStream.getTracks().forEach((track) => {
          track.enabled = true;
        });
        // mediaStream.getTracks()[0].enabled = true;
      }
    }
  }, [model.TXFrequencies]);

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

    io.on("tryDisconnectPeer", (user: string) => {
      //console.log("try disconnect peer", user);

      const peer = model.peers.get(user);
      if (!peer) {
        return;
      }
      peer.destroy();
      model.peers.delete(user);
    });

    io.on("tryConnectPeer", (user: string, freq: number) => {
      const peerExists = model.peers.get(user);

      if (peerExists && !peerExists.destroyed) {
        console.log("peer exists already");
        return;
      }

      if (peerExists?.connected) {
        console.log("already connected");
        return;
      }

      // const newStream = stream.clone();
      // model.freqToMediaStream.set(freq, newStream);

      let newStream = stream;
      if (model.freqToMediaStream.get(freq) !== stream) {
        console.log("cloning on initiator");
        newStream = stream.clone();
        newStream.getAudioTracks().forEach((track) => {
          track.enabled = true; // Ensure the track is enabled
        });
        console.log("New stream tracks: " + newStream.getTracks().length);
        model.freqToMediaStream.set(freq, newStream);
      }

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: newStream ?? undefined,
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
      console.log("Peer has stream ", newStream);

      peer.on("signal", (offerSignal) => {
        console.log("initiator sending offer signal with freq: " + freq);
        if (freq != undefined) {
          io.emit("callUser", {
            userToCall: user,
            signalData: offerSignal,
            from: io.id,
            freq: freq,
          });
        } else {
          console.log("calluser freq error");
          return;
        }
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
      toast.success("Got XC");
      console.log("got XC", data);

      model.XCFrequencies = data;
    });

    io.on("createXC", (data: any) => {
      if (data.error) {
        return toast.error("error creating XC: " + data.error);
      }
      toast.success("XC created");
      console.log("XC created", data);

      model.XCFrequencies = model.XCFrequencies.concat([data]);
    });

    io.on("deleteXC", (data: any) => {
      if (data.error) {
        return toast.error("error deleting XC: " + data.error);
      }
      toast.success("XC deleted");
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
      toast.success("XC updated");
      console.log("XC updated", data);

      model.XCFrequencies = model.XCFrequencies.map((xc) => {
        if (xc.id === data.id) {
          return data;
        }
        return xc;
      });
    });

    io.on("hey", (data) => {
      console.log("Stream in hey", stream);
      console.log("Entering Hey with freq: " + data.freq);
      console.log("Creating a new stream for peer-to-peer connection...");

      let tempStream = stream;
      console.log("Temp stream tracks: " + tempStream.getTracks().length);
      if (model.freqToMediaStream.get(data.freq) !== stream) {
        console.log("cloning on receiver");
        tempStream = stream.clone();
        model.freqToMediaStream.set(data.freq, tempStream);
      }
      tempStream.getAudioTracks().forEach((track) => {
        track.enabled = true; // Ensure the track is enabled
      });
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: tempStream ?? undefined,
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
      console.log("Peer has stream ", tempStream);

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

    // Assign toggled on tracks
    io.on("toggleTracks", (frequencies) => {});

    return () => {
      io.disconnect();
    };
  }, [stream]);

  useEffect(() => {
    console.log(model.eggState);
  }, [model.radioGain]);

  return <></>;
});

export default SocketHandler;
