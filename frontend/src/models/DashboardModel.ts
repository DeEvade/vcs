import { Socket } from "socket.io-client";

export default {
  fetchConfigs: function () {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("getAllData");
  },
  selectedConfigurationId: null as number | null,

  addRole: function (role: {
    name: string;
    type: "ATC" | "pilot";
    configurationId: number;
  }) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("addRole", {
      type: role.type,
      name: role.name,
      configurationId: role.configurationId,
    });
  },
  addFrequency: function (frequency: {
    frequency: string;
    label: "";
    configurationId: number;
  }) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("addFrequency", {
      frequency: frequency.frequency,
      label: frequency.label,
      configurationId: frequency.configurationId,
    });
  },
  deleteRole: function (roleId: number) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("deleteRole", { roleId: roleId });
  },

  selectedFrequency: undefined as any | undefined,

  roles: [] as DashboardRole[],
  frequencies: [] as DashboardFrequency[],
  roleFrequencies: [] as DashboardRoleFrequency[],
  configs: undefined as DashboardConfiguration[] | undefined,

  socket: {
    connected: false,
    io: null as Socket | null,
  },
};
export interface DashboardFrequency {
  id: number;
  frequency: string;
  label: string;
  order?: number;
}
export interface DashboardRoleFrequency {
  id: number;
  role: DashboardRole;
  frequency: DashboardFrequency;
  order: number;
}

export interface DashboardRole {
  id: number;
  name: string;
  type: "ATC" | "pilot";
}

export interface DashboardConfiguration {
  id: number;
  name: string;
}
