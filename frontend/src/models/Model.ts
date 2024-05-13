import { Call, Configuration, Role, XC, PeerObject } from "@/types";
import Peer from "simple-peer";
import { Socket } from "socket.io-client";

export const model = {
  devMode: false as boolean,
  configuration: null as Configuration | null,
  selectedRoles: [] as string[],
  openRoleModal: true as boolean,

  easyMode: false as boolean,
  radioGain: 50 as number,
  micGain: 50 as number,
  PTTKey: "Space" as string,
  txState: false as boolean,
  analyserActive: false as boolean,
  analyserVolume: 0 as number,
  eggState: false as boolean,

  socket: {
    connected: false,
    io: null as Socket | null,
  },

  // Keeps track in which frequency a user has a peer.
  // <[id, frequency], peer>
  //peersToFreq: new Map() as Map<[string, string], Peer.Instance>,

  // Regular map
  peers: new Map() as Map<string, PeerObject>,

  //Array to keep track of pressed frequencies
  RXFrequencies: [] as number[], //Array of which RX are pressed
  NORXFrequencies: [] as number[], //(before updating RX) RX frequencies that are not active anymore
  TXFrequencies: [] as number[], //Array of which TX are pressed
  XCFrequencies: [] as XC[], //Array of which XC are pressed

  pendingCalls: [] as Call[], //Number of active calls
  acceptedCalls: [] as Call[], //Calls that have been accepted

  //Function that keeps track if a user has choosen pilot as its role
  isPilot: function () {
    for (const role of this.selectedRoles) {
      const roleObj = this.getRoleFromName(role);
      if (roleObj?.type === "pilot") {
        return true;
      }
    }
    return false;
  },

  //Function that emits to the server to create a call
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

  //Function to handle making or accepting a call
  onMakeAcceptCall: function (call: Call, isAccepted: boolean) {
    if (!this.socket.io || !this.socket.connected) return;
    this.pendingCalls = this.pendingCalls.filter((c) => c.id !== call.id);

    this.socket.io.emit("acceptICCall", { call: call, isAccepted: isAccepted });
  },

  //Function that handles turning off a call
  onTurnOffCall: function (call: Call) {
    if (!this.socket.io || !this.socket.connected) return;

    this.socket.io.emit("endICCall", call);
  },

  //Emits updated frequencies to the server
  onFrequencyChange: function (frequencies: number[]) {
    if (!this.socket.io || !this.socket.connected) return;

    this.socket.io.emit("updatedFrequencies", frequencies);
  },

  //Emits cross coupling frequencies to the server
  crossCoupling: function (XCfrequencies: number[]) {
    if (!this.socket.io || !this.socket.connected) return;

    this.socket.io.emit("crossCoupling", XCfrequencies);
  },

  //Returns the state of a given frequency
  getFrequencyState: function (frequency: number) {
    return {
      RX: this.RXFrequencies.includes(frequency),
      TX: this.TXFrequencies.includes(frequency),
      XC: this.XCFrequencies.find((f) => f.frequencyIds.includes(frequency)),
    };
  },

  //Returns the state of selected roles based on the configuration
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
  //Handles frequencies user has joined by emitting RXfrequencies array to the server
  handleFrequencyJoined: function () {
    if (
      !this.socket.io ||
      !this.socket.connected ||
      this.RXFrequencies == null
    ) {
      return;
    }
    this.socket.io.emit("connectFreq", this.RXFrequencies);
  },

  //Handles frequencies user has disconnected from by emitting NORXfrequencies array to the server
  handleFrequencyDisconnect: function () {
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

  //Returns the role from userID
  getRoleFromName: function (name: string): Role | null {
    if (!this.configuration) {
      return null;
    }

    return this.configuration.roles.find((role) => role.name === name) ?? null;
  },

  //Emits to the server to fetch configuration
  fetchConfiguration: function () {
    if (!this.socket.io || !this.socket.connected) {
      return;
    }
    this.socket.io.emit("getCurrentConfig");
  },

  //Emits to the server to fetch cross couplings
  fetchXC: function () {
    if (!this.socket.io || !this.socket.connected) {
      return;
    }
    this.socket.io.emit("getCurrentXC");
  },

  getMyReasons: function (userId: string) {
    if (!this.socket.io || !this.socket.connected) {
      return;
    }
    this.socket.io.emit("getMyReasons", { userId: userId });
  },
  //Emits a request to create a new cross coupling with frequencyIds to the server
  createXC(frequencyId: number, checkedFrequencies: number[]) {
    if (!this.socket.io || !this.socket.connected) {
      return;
    }
    this.socket.io.emit("createXC", {
      frequencyIds: checkedFrequencies.concat(frequencyId),
    });
  },

  //Emits a request to update an existing cross coupling with specified frequencyIds to the server
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

  //Sets PTT key
  setPTTKey: function (key: string) {
    this.PTTKey = key;
  },

  //Sets easy mode available on the main menu
  setEasyMode: function (isEasy: boolean) {
    this.easyMode = isEasy;
  },

  //Sets open role modal
  setOpenRoleModal(isOpen: boolean) {
    this.openRoleModal = isOpen;
  },

  //Adds a selected role
  addSelectedRole: function (role: string) {
    this.selectedRoles = this.selectedRoles.concat(role);
  },

  //Removes a selected role
  removeSelectedRole: function (role: string) {
    this.selectedRoles = this.selectedRoles.filter((r) => r !== role);
  },
};
