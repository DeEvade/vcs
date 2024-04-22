import { observer } from "mobx-react-lite";
import { model as baseModel } from "@/models/Model";

import { io as socket } from "socket.io-client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { roleFrequencyToFrequency } from "@/utils/responseConverter";
import Peer from "simple-peer";
import { log } from "console";
interface Props {
  model: typeof baseModel;
}
const SocketHandler = observer((props: Props) => {
  const { model } = props;
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (navigator.mediaDevices === undefined) {
      toast("Media devices not supported", { icon: "❌" });
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("Got stream", stream);

        setStream(stream);
      });
  }, []);

  useEffect(() => {
    if (!stream || model.socket.io) {
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
      const peerExists = model.peers.get(user);
      if (peerExists) {
        return;
      }

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream ?? undefined,
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

      peer.on("signal", (data) => {
        io.emit("callUser", {
          userToCall: user,
          signalData: data,
          from: io.id,
        });
      });
      model.peers.set(user, peer);
    });

    io.on("userLeft", (user: string) => {
      const peer = model.peers.get(user);
      if (!peer) {
        return;
      }
      model.peers.delete(user);
    });

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

      console.log("hey", data.from, data.signal);

      peer.on("signal", (signalData) => {
        io.emit("acceptCall", {
          signal: signalData,
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
