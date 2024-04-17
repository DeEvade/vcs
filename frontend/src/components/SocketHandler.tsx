import { observer } from "mobx-react-lite";
import { model as baseModel } from "@/models/Model";

import { io as socket } from "socket.io-client";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { roleFrequencyToFrequency } from "@/utils/responseConverter";

interface Props {
  model: typeof baseModel;
}
const SocketHandler = observer((props: Props) => {
  const { model } = props;

  useEffect(() => {
    const io = socket("localhost:8080");
    io.on("connect", () => {
      toast("Connected to socket server", { icon: "🚀" });
      model.socket.io = io;
      model.socket.connected = true;
      console.log("connected to socket server");
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
  });

  return <></>;
});

export default SocketHandler;
