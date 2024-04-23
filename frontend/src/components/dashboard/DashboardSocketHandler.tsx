import { observer } from "mobx-react-lite";

import { io as socket } from "socket.io-client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { roleFrequencyToFrequency } from "@/utils/responseConverter";
import Peer from "simple-peer";
import { log } from "console";
import DashboardModel from "@/models/DashboardModel";
interface Props {
  model: typeof DashboardModel;
}
const DashboardSocketHandler = observer((props: Props) => {
  const { model } = props;

  useEffect(() => {
    const io = socket(window.location.hostname + ":8080");
    io.on("connect", () => {
      toast("Connected to socket server", { icon: "🚀" });
      model.socket.io = io;
      model.socket.connected = true;
    });

    io.on("getAllData", (data: any) => {
      if (data.error) {
        return toast.error("data fetch error: " + data.error);
      }
      toast.success("data fetched successfully");
      console.log("got all data", data);
      model.configs = data.configs;
      model.roles = data.roles;
      model.roleFrequencies = data.roleFrequencies;
      model.frequencies = data.frequencies;
    });

    io.on("disconnect", () => {
      console.log("disconnected from socket server");
    });

    return () => {
      model.socket.connected = false;
      io.disconnect();
    };
  }, []);

  return <></>;
});

export default DashboardSocketHandler;