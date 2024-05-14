// src/types/index.ts
import Peer from "simple-peer";

export interface Frequency {
  id: number;
  frequency: string;
  order: number;
  isPrimary: boolean;
}

export interface Role {
  id: number;
  name: string;
  delay: number;
  type: "ATC" | "pilot";
  frequencies: Frequency[];
}

export interface Configuration {
  id: number;
  name: string;
  roles: Role[];
}

export interface FrequencyState {
  RX: boolean;
  TX: boolean;
  XC: boolean;
}

export interface XC {
  id: number;
  frequencyIds: number[];
}

export interface Call {
  id: string;
  initiator: string;
  initiatorRole: string;
  receiver: string;
  receiverRole: string;
  isEmergency: boolean;
}

export interface PeerObject {
  reasons: Array<number>;
  peer: Peer.Instance;
  stream: MediaStream;
}
