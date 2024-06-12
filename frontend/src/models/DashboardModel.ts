import { Socket } from "socket.io-client";

export default {
  devmode: true as boolean,
  fetchConfigs: function () {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("getAllData");
  },

  selectedConfigurationId: null as number | null,
  activeConfigId: null as number | null,
  delayTime: 1 as number,

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

  setActiveConfig: function (configId: number) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("setActiveConfig", { configId: configId });
  },

  addConfig(name: string) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("addConfig", { name: name });
  },

  editConfig: function (name: string) {
    if (!this.socket.connected && this.selectedConfigurationId) {
      return;
    }
    this.socket.io?.emit("editConfig", {
      id: this.selectedConfigurationId,
      name: name,
    });
  },

  deleteConfig: function (configurationId: number) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("deleteConfig", { id: configurationId });
  },

  addFrequency: function (frequency: {
    frequency: string;
    configurationId: number;
  }) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("addFrequency", {
      frequency: frequency.frequency,
      configurationId: frequency.configurationId,
    });
  },
  editFrequency: function (frequency: {
    frequencyId: number;
    frequency: string;
    configurationId: number;
  }) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("editFrequency", {
      frequencyId: frequency.frequencyId,
      frequency: frequency.frequency,
      configurationId: frequency.configurationId,
    });
  },
  deleteFrequency: function (frequencyId: number) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("deleteFrequency", { frequencyId: frequencyId });
  },
  deleteRole: function (roleId: number) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("deleteRole", { roleId: roleId });
  },
  editRole: function (role: {
    roleId: number;
    name: string;
    type: "ATC" | "pilot";
    delay: number;
  }) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("editRole", {
      roleId: role.roleId,
      name: role.name,
      type: role.type,
      delay: role.delay,
    });
  },

  onDeleteRoleFrequency: function (roleId: number, frequencyId: number) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("deleteRoleFrequency", {
      roleId: roleId,
      frequencyId: frequencyId,
    });
  },
  onAddPrimaryFrequency: function (roleId: number, frequencyId: number) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("addRoleFrequency", {
      isPrimary: true,
      roleId: roleId,
      frequencyId: frequencyId,
    });
  },
  onAddSecondaryFrequency: function (roleId: number, frequencyId: number) {
    if (!this.socket.connected) {
      return;
    }
    this.socket.io?.emit("addRoleFrequency", {
      isPrimary: false,
      roleId: roleId,
      frequencyId: frequencyId,
    });
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
  order?: number;
  isPrimary?: boolean;
  configurationId: number;
}
export interface DashboardRoleFrequency {
  id: number;
  role: DashboardRole;
  frequency: DashboardFrequency;
  isPrimary: boolean;
  order: number;
}

export interface DashboardRole {
  id: number;
  name: string;
  delay: number;
  type: "ATC" | "pilot";
  configurationId: number;
}

export interface DashboardConfiguration {
  id: number;
  name: string;
}
