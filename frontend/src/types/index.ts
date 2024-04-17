// src/types/index.ts

export interface Frequency {
  id: number;
  frequency: string;
  label: string;
  order: number;
}

export interface Role {
  id: number;
  name: string;
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
