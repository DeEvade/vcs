import { observer } from "mobx-react-lite";

import { io as socket } from "socket.io-client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { roleFrequencyToFrequency } from "@/utils/responseConverter";
import Peer from "simple-peer";
import DashboardModel from "@/models/DashboardModel";
interface Props {
  model: typeof DashboardModel;
}
// Establishes socket connection and sets up event listeners
const DashboardSocketHandler = observer((props: Props) => {
  const { model } = props;

  useEffect(() => {
    const io = socket(
      window.location.hostname + (model.devmode === true ? ":8080" : "")
    );

    // Listens for successful socket connections
    io.on("connect", () => {
      toast("Connected to socket server", { icon: "🚀" });
      model.socket.io = io;
      model.socket.connected = true;
    });

    // Removes a specific frequency from the roleFrequencies array based on the data provided
    io.on("deleteRoleFrequency", (data: any) => {
      if (data.error) {
        return toast.error("error deleting role frequency: " + data.error);
      }
      model.roleFrequencies = model.roleFrequencies.filter(
        (RF) => RF.id !== data.id
      );
    });

    // Adds a specific frequency to the roleFrequencies array with the data provided
    io.on("addRoleFrequency", (data: any) => {
      if (data.error) {
        return toast.error("error setting secondary frequency: " + data.error);
      }
      toast.success("frequency link added successfully");

      model.roleFrequencies = model.roleFrequencies.concat([data]);
    });

    // Sets a frequency as the second frequency in the roleFrequencies array
    io.on("setSecondaryFrequency", (data: any) => {
      if (data.error) {
        return toast.error("error setting secondary frequency: " + data.error);
      }
      model.roleFrequencies = model.roleFrequencies.concat([data]);
    });

    // Adds a new role in the roles array with the data provided
    io.on("addRole", (data: any) => {
      if (data.error) {
        return toast.error("error adding role: " + data.error);
      }
      toast.success("role added successfully");
      console.log("role added", data);
      model.roles = model.roles.concat(data);
    });

    // Adds a new frequency to the frequencies array with the data provided
    io.on("addFrequency", (data: any) => {
      if (data.error) {
        return toast.error("error adding frequency: " + data.error);
      }
      toast.success("frequency added successfully");
      console.log("frequency added", data);
      model.frequencies = model.frequencies.concat(data);
    });

    // Removes a specific frequency from the frequencies array
    io.on("deleteFrequency", (data: any) => {
      if (data.error) {
        return toast.error("error deleting frequency: " + data.error);
      }
      toast.success("frequency deleted successfully");
      console.log("frequency deleted", data);
      model.frequencies = model.frequencies.filter(
        (frequency) => frequency.id !== data.id
      );
    });

    // Handles editing of a frequency and updates the array frequencies
    io.on("editFrequency", (data: any) => {
      if (data.error) {
        return toast.error("error editing frequency: " + data.error);
      }
      toast.success("frequency edited successfully");
      console.log("frequency edited", data);
      const newFrequencies = model.frequencies.map((frequency) => {
        if (frequency.id === data.id) {
          return data;
        }
        return frequency;
      });
      model.frequencies = newFrequencies.filter((f) => true);
    });

    // Adds a new config of the data provided and updates selected configuration with its config id 
    io.on("addConfig", (data: any) => {
      if (data.error) {
        return toast.error("error adding config: " + data.error);
      }

      toast.success("config added successfully");
      model.configs = model.configs?.concat(data);
      model.selectedConfigurationId = data.id;
    });

    // Handles editing of a configuration and updates the array configs
    io.on("editConfig", (data: any) => {
      if (data.error) {
        return toast.error("error editing config: " + data.error);
      }
      toast.success("config edited successfully");
      console.log("config edited", data);
      const newConfigs = model.configs?.map((config) => {
        if (config.id === data.id) {
          return data;
        }
        return config;
      });
      model.configs = newConfigs?.filter((c) => true);
    });

    // Removes a specific configuration from the config array
    io.on("deleteConfig", (data: any) => {
      if (data.error) {
        return toast.error("error deleting config: " + data.error);
      }
      toast.success("config deleted successfully");
      console.log("config deleted", data);
      model.selectedConfigurationId = null;
      model.configs = model.configs?.filter((config) => config.id !== data.id);
    });

    // Removes a specific role from the roles array
    io.on("deleteRole", (data: any) => {
      if (data.error) {
        return toast.error("error deleting role: " + data.error);
      }
      toast.success("role deleted sucessfully");
      model.roles = model.roles.filter((role) => role.id !== data.id);
    });

    // Handles editing of a role and updates the array roles
    io.on("editRole", (data: any) => {
      if (data.error) {
        return toast.error("error changing role: " + data.error);
      }
      toast.success("role changed sucessfully");
      console.log("role changed", data);
      const x = model.roles.map((role) => {
        if (role.id === data.id) {
          return data;
        }
        return role;
      });
      model.roles = x.filter((r) => true);
    });

    // Listens for setting an active configuration and updates the activeConfigId
    io.on("setActiveConfig", (data: any) => {
      if (data.error) {
        return toast.error("error setting active config: " + data.error);
      }
      toast.success("active config set successfully");
      console.log("active config set", data);
      model.activeConfigId = data.id;
    });

    // Listens for receiving all data from the server and updates all data
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
      model.activeConfigId = data.activeConfigId;
    });

    // Listens for disconnection from the socket server and handles the cleanup
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
