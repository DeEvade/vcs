// src/types/index.ts

export interface Frequency {
    id: number
    frequency: string
    label: string
}

export interface FrequencyState {
    [key: number]: {
        RX: boolean
        TX: boolean
        XC: boolean
    }
}

export interface Role {
    name: string
    primaryFrequency?: string
}
