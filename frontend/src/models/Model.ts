import { Configuration, Role } from "@/types";
import Peer from "simple-peer";
import { Socket } from "socket.io-client";

export const model = {
  configuration: null as Configuration | null,
  selectedRole: null as string | null,
  openRoleModal: true as boolean,

  easyMode: false as boolean,
  radioGain: 100 as number,
  micGain: 100 as number,
  PTTKey: "Space" as string,

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
    console.log("handles frequency" + this.RXFrequencies)
    if (!this.socket.io || !this.socket.connected || (this.RXFrequencies == null)) {
      return;
    }
    this.socket.io.emit("connectFreq", this.RXFrequencies);
    console.log("it has emited changes to socket"); //printar det här
  },

  handleFrequencyDisconnect: function () {
    console.log("handles frequency" + this.RXFrequencies)
    if (!this.socket.io || !this.socket.connected || (this.RXFrequencies == null)) {
      return;
    }
   // console.log("RX" + this.RXFrequencies);
   if(this.NORXFrequencies !== null){
    this.socket.io.emit("disconnectFreq", this.NORXFrequencies);
    console.log("Emitted disconnect");
   }
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
