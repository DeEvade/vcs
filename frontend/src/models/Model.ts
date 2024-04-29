import { Configuration, Role } from '@/types';
import Peer from 'simple-peer';
import { Socket } from 'socket.io-client';

export const model = {
  configuration: null as Configuration | null,
  selectedRoles: [] as string[],
  openRoleModal: true as boolean,

  easyMode: false as boolean,
  radioGain: 100 as number,
  PTTKey: 'Space' as string,

  socket: {
    connected: false,
    io: null as Socket | null,
  },

  peers: new Map() as Map<string, Peer.Instance>,

  RXFrequencies: [] as number[],
  TXFrequencies: [] as number[],
  XCFrequencies: [] as number[],

  onFrequencyChange: function (frequencies: number[]) {
    if (!this.socket.io || !this.socket.connected) return;

    this.socket.io.emit('updatedFrequencies', frequencies);
  },

  crossCoupling: function (XCfrequencies: number[]){
    if (!this.socket.io || !this.socket.connected) return;

    this.socket.io.emit("crossCoupling", XCfrequencies);
  },

  getFrequencyState: function (frequency: number) {
    return {
      RX: this.RXFrequencies.includes(frequency),
      TX: this.TXFrequencies.includes(frequency),
      XC: this.XCFrequencies.includes(frequency),
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
    this.socket.io.emit('getCurrentConfig');
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
