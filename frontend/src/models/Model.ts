import { Configuration, Role, XC } from "@/types";
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
  eggState: false as boolean,

  socket: {
    connected: false,
    io: null as Socket | null,
  },

  // Keeps track in which frequency a user has a peer.
  // <[id, frequency], peer>
  peersToFreq: new Map() as Map<[string, string], Peer.Instance>,

  // Regular map
  peers: new Map() as Map<string, Peer.Instance>,


  // Frequency to MediaStream map
  // Keeps track for each user which of their streams is connected to what frequency
  freqToMediaStream: new Map() as Map<number, MediaStream>,


  RXFrequencies: [] as number[],
  NORXFrequencies: [] as number[], // (before updating RX) RX frequencies that are not active anymore
  TXFrequencies: [] as number[],
  XCFrequencies: [] as XC[],

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
    console.log("it has emited changes to socket"); //printar det här
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
      console.log("Emitted disconnect");
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
