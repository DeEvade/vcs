import { observer } from "mobx-react-lite";
import { model as baseModel } from "@/models/Model";

import { io as socket } from "socket.io-client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { roleFrequencyToFrequency } from "@/utils/responseConverter";
import Peer from "simple-peer";
import { log } from "console";
import { v4 as uuidv4 } from "uuid";

interface Props {
  model: typeof baseModel;
}
const SocketHandler = observer((props: Props) => {
  const { model } = props;
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (stream !== null) return;

    if (navigator.mediaDevices === undefined) {
      toast("Media devices not supported", { icon: "❌" });
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        console.log("reallyyy??!! Got stream???!", stream); // kommer hit
      })
      .catch((error) => {
        console.error("Error getting stream", error);
        toast.error("Error getting stream");
      });
  }, []);

  useEffect(() => {
    if (stream === null) {
      return;
    } else {
      console.log("Stream in socket handler", stream);
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
        // wrtc: { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate },
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
        console.log("initiator sending offer signal");
        io.emit("callUser", {
          userToCall: user,
          signalData: offerSignal,
          from: io.id,
        });
        model.peers.set(user, peer);
      });
    });

    io.on("peerDisconnect", (userId: string) => {
      const peer = model.peers.get(userId);
      console.log("user id to disconnect " + userId);
      console.log("peer to disconnect " + peer?.connected);
      if (peer) {
        peer.destroy();
        model.peers.delete(userId);
      }
      console.log("peer to disconnect after destroy " + peer?.connected);
    });

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
