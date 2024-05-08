import { Call, Configuration, Role, XC } from "@/types";
import Peer from "simple-peer";
import { Socket } from "socket.io-client";

export const model = {
  devMode: true as boolean,
  configuration: null as Configuration | null,
  selectedRoles: [] as string[],
  openRoleModal: true as boolean,

  easyMode: false as boolean,
  radioGain: 50 as number,
  micGain: 50 as number,
  PTTKey: "Space" as string,
  txState: false as boolean,

  socket: {
    connected: false,
    io: null as Socket | null,
  },

  // Keeps track in which frequency a user has a peer.
  // <[id, frequency], peer>
  peersToFreq: new Map() as Map<[string, string], Peer.Instance>,

  // Regular map
  peers: new Map() as Map<string, Peer.Instance>,

  RXFrequencies: [] as number[],
  NORXFrequencies: [] as number[], // (before updating RX) RX frequencies that are not active anymore
  TXFrequencies: [] as number[],
  XCFrequencies: [] as XC[],

  pendingCalls: [] as Call[],
  acceptedCalls: [] as Call[],

  isPilot: function () {
    for (const role of this.selectedRoles) {
      const roleObj = this.getRoleFromName(role);
      if (roleObj?.type === "pilot") {
        return true;
      }
    }
    return false;
  },

  onMakeICCall: function (role: string, isEmergency: boolean) {
    if (!this.socket.io || !this.socket.connected) return;

    this.socket.io.emit("ICCall", {
      id: "",
      initiator: this.socket.io.id,
      initiatorRole: this.selectedRoles[0],
      receiver: "",
      receiverRole: role,
      isEmergency: isEmergency,
    } as Call);
  },

  onMakeAcceptCall: function (call: Call, isAccepted: boolean) {
    if (!this.socket.io || !this.socket.connected) return;
    this.pendingCalls = this.pendingCalls.filter((c) => c.id !== call.id);

    this.socket.io.emit("acceptICCall", { call: call, isAccepted: isAccepted });
  },

  onTurnOffCall: function (call: Call) {
    if (!this.socket.io || !this.socket.connected) return;

    this.socket.io.emit("endICCall", call);
  },

  onFrequencyChange: function (frequencies: number[]) {
    if (!this.socket.io || !this.socket.connected) return;

    this.socket.io.emit("updatedFrequencies", frequencies);
  },

  crossCoupling: function (XCfrequencies: number[]) {
    if (!this.socket.io || !this.socket.connected) return;

    this.socket.io.emit("crossCoupling", XCfrequencies);
  },

  getFrequencyState: function (frequency: number) {
    return {
      RX: this.RXFrequencies.includes(frequency),
      TX: this.TXFrequencies.includes(frequency),
      XC: this.XCFrequencies.find((f) => f.frequencyIds.includes(frequency)),
    };
  },

  getSelectedRolesObject: function (): Role[] | null {
    if (!this.configuration || !this.selectedRoles) {
      return null;
    }

    console.log(this.configuration.roles);

    return (
      this.configuration.roles.filter((role) =>
        this.selectedRoles?.includes(role.name)
      ) ?? null
    );
  },
  // Uses socket to emit all frequencies that the current user is recieving from.
  handleFrequencyJoined: function () {
    console.log("handles frequency" + this.RXFrequencies);
    if (
      !this.socket.io ||
      !this.socket.connected ||
      this.RXFrequencies == null
    ) {
      return;
    }
    this.socket.io.emit("connectFreq", this.RXFrequencies);
  },

  handleFrequencyDisconnect: function () {
    console.log("handles frequency" + this.RXFrequencies);
    if (
      !this.socket.io ||
      !this.socket.connected ||
      this.RXFrequencies == null
    ) {
      return;
    }
    if (this.NORXFrequencies !== null) {
      this.socket.io.emit("disconnectFreq", this.NORXFrequencies);
    }
  },

  getRoleFromName: function (name: string): Role | null {
    if (!this.configuration) {
      return null;
    }

    return this.configuration.roles.find((role) => role.name === name) ?? null;
  },

  fetchConfiguration: function () {
    if (!this.socket.io || !this.socket.connected) {
      return;
    }
    this.socket.io.emit("getCurrentConfig");
  },

  fetchXC: function () {
    if (!this.socket.io || !this.socket.connected) {
      return;
    }
    this.socket.io.emit("getCurrentXC");
  },

  createXC(frequencyId: number, checkedFrequencies: number[]) {
    if (!this.socket.io || !this.socket.connected) {
      return;
    }
    console.log("createXC", frequencyId, checkedFrequencies);

    this.socket.io.emit("createXC", {
      frequencyIds: checkedFrequencies.concat(frequencyId),
    });
  },

  updateXC(frequencyId: number, checkedFrequencies: number[], XCId: number) {
    if (
      !this.socket.io ||
      !this.socket.connected ||
      !XCId ||
      !frequencyId ||
      !checkedFrequencies
    ) {
      return;
    }
    console.log("updateXC", frequencyId, checkedFrequencies, XCId);

    this.socket.io.emit("updateXC", {
      id: XCId,
      frequencyIds: checkedFrequencies.concat(frequencyId),
    });
  },

  setPTTKey: function (key: string) {
    this.PTTKey = key;
  },

  setEasyMode: function (isEasy: boolean) {
    this.easyMode = isEasy;
  },

  setOpenRoleModal(isOpen: boolean) {
    this.openRoleModal = isOpen;
  },

  addSelectedRole: function (role: string) {
    this.selectedRoles = this.selectedRoles.concat(role);
  },

  removeSelectedRole: function (role: string) {
    this.selectedRoles = this.selectedRoles.filter((r) => r !== role);
  },
};
