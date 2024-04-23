import { Configuration, Role } from "@/types";
import Peer from "simple-peer";
import { Socket } from "socket.io-client";

export const model = {
  configuration: null as Configuration | null,
  selectedRole: null as string | null,
  openRoleModal: true as boolean,

  easyMode: false as boolean,
  radioGain: 100 as number,
  PTTKey: "Space" as string,

  socket: {
    connected: false,
    io: null as Socket | null,
  },

  peers: new Map() as Map<string, Peer.Instance>,

  RXFrequencies: [] as number[],
  TXFrequencies: [] as number[],
  XCFrequencies: [] as number[],

  getFrequencyState: function (frequency: number) {
    return {
      RX: this.RXFrequencies.includes(frequency),
      TX: this.TXFrequencies.includes(frequency),
      XC: this.XCFrequencies.includes(frequency),
    };
  },

  getSelectedRoleObject: function (): Role | null {
    if (!this.configuration || !this.selectedRole) {
      return null;
    }

    console.log(this.configuration.roles);

    return (
      this.configuration.roles.find(
        (role) => role.name === this.selectedRole
      ) ?? null
    );
  },

  // Uses socket to emit all frequencies that the current user is recieving from.
  handleFrequencyJoined: function () {
    if (!this.socket.io || !this.socket.connected) {
      return;
    }
    this.socket.io.emit("connectFreq", this.RXFrequencies);
  },

  fetchConfiguration: function () {
    if (!this.socket.io || !this.socket.connected) {
      return;
    }
    this.socket.io.emit("getCurrentConfig");
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

  setSelectedRole: function (role: string) {
    this.selectedRole = role;
  },
};
