import { observer } from "mobx-react-lite";
import { model as baseModel } from "@/models/Model";
import { io as socket } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { roleFrequencyToFrequency } from "@/utils/responseConverter";
import Peer from "simple-peer";
import { log } from "console";
import { v4 as uuidv4 } from 'uuid';
import micGain from "./ConfigMenu";
import setMicGain from "./ConfigMenu";
import ConfigMenu from "./ConfigMenu";

interface Props {
  model: typeof baseModel;
}

const SocketHandler = observer((props: Props) => {
  const { model } = props;
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  // const audioContext = new AudioContext();
  // const gainNode = audioContext.createGain();

  useEffect(() => {
    if(stream !== null) return;
    if (navigator.mediaDevices === undefined) {
      toast("Media devices not supported", { icon: "❌" });
      return;
    }

    navigator.mediaDevices
      .getUserMedia(
        { video: true, 
          audio:
            {
             autoGainControl: false,
             channelCount: 2,
             echoCancellation: false,
             noiseSuppression: false,
             sampleRate: 44000,
             sampleSize: 16,
            }
         })
      .then((stream) => {
        console.log("Got stream", stream); //kommer hit   
        
        const audioContext = new AudioContext();
        const mediaStreamSource = audioContext.createMediaStreamSource(stream);
        const mediaStreamDestination = audioContext.createMediaStreamDestination();

        const lowpassFilter = audioContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.value = 2500;

        const node = audioContext.createGain();
        node.gain.value = model.micGain/50;
        //gainNode.gain.value = model.micGain/50;

        mediaStreamSource.connect(node).connect(lowpassFilter).connect(mediaStreamDestination);
        //mediaStreamSource.connect(gainNode).connect(mediaStreamDestination);
        
        setStream(mediaStreamDestination.stream);
    
        console.log("reallyyy??!! Got stream???!", stream); // kommer hit
        setGainNode(node);
      })
  }, []);

  
  useEffect(() => {
    if (!gainNode) return;

    try {
      gainNode.gain.value = model.micGain/50;
      console.log("Gain value is: " + model.micGain/50);
    } catch (error) {
      console.log("MEGAERROR!!");
    }
    
  },[model.micGain, gainNode])

  useEffect(() => {
    if (!stream) {
      return;
    }

    const io = socket(window.location.hostname + ":8080");
    io.on("connect", () => {
      toast("Connected to socket server", { icon: "🚀" });
      model.socket.io = io;
      model.socket.connected = true;
      console.log("connected to socket server");
    });

    io.on("newUser", (user: string) => {
      console.log("new user has connected"); //vi kommer hit
      const peerExists = model.peers.get(user);

      if (peerExists && (!peerExists.destroyed)) {
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
        wrtc: {RTCPeerConnection, RTCSessionDescription, RTCIceCandidate},
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

      
      peer.on("signal", (offerSignal) => {
        console.log("initiator sending offer signal")
          io.emit("callUser", {
            userToCall: user,
            signalData: offerSignal,
            from: io.id,
          });
        model.peers.set(user, peer); 
        })
    });

    io.on("peerDisconnect", (userId: string) => {
      const peer = model.peers.get(userId);
      console.log("user id to disconnect " + userId);
      console.log("peer to disconnect " + peer?.connected);
      if(peer){
        peer.destroy(); 
        model.peers.delete(userId);
      }
      console.log("peer to disconnect after destroy " + peer?.connected);    
    })

    // io.on("userLeft", (user: string) => {
    //   console.log("we are in userLeft")
    //   const peer = model.peers.get(user);
    //   if (!peer) {
    //     console.log("userLeft not happening")
    //     return;
    //   }
    //   console.log("userLeft now")
    //   model.peers.delete(user);
    // });

    io.on("callAccepted", (signal: any) => {
      
      console.log("call accepted", signal);
      
      const peer = model.peers.get(signal.from);
      if (!peer) {
        return;
      }
      
      peer.signal(signal.signal);
    });

    io.on("hey", (data: any) => {
      console.log("Stream in hey", stream);
      

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream ?? undefined,
        //ice servers
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