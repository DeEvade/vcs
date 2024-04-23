import { Socket } from "socket.io-client";

export default {
  fetchConfigs: function () {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("getAllData");
  },

  selectedFrequency: undefined as any | undefined,

  roles: [] as Role[],
  frequencies: [] as Frequency[],
  roleFrequencies: [] as RoleFrequency[],
  configs: undefined as Configuration[] | undefined,

  socket: {
    connected: false,
    io: null as Socket | null,
  },
};
interface Frequency {
  id: number;
  frequency: string;
  label: string;
}
interface RoleFrequency {
  id: number;
}

interface Role {
  id: number;
  name: string;
  type: "ATC" | "pilot";
}

interface Configuration {
  id: number;
  name: string;
}
