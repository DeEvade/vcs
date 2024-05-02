// src/components/FrequenciesGrid.tsx
'use client'
import React, { useState } from 'react'
import { SimpleGrid } from '@chakra-ui/react'
import FrequencyCard from './FrequencyCard'
import { Frequency, FrequencyState } from '../types'

// Some hardcoded frequencies
const initialFrequencies: Frequency[] = [
    { id: 1, frequency: '118.505', label: 'SA TWR W' },
    { id: 2, frequency: '126.655', label: 'OS ARR-E' },
    { id: 3, frequency: '131.130', label: 'OS P3' },
    { id: 4, frequency: '120.505', label: 'OS DIR-E' },
    // Add more as needed
]

const FrequenciesGrid: React.FC = () => {
    const initialState: FrequencyState = initialFrequencies.reduce(
        (acc, { id }) => ({
            ...acc,
            [id]: { RX: false, TX: false, XC: false },
        }),
        {},
    )

    const [frequencyStates, setFrequencyStates] = useState<FrequencyState>(initialState)

    const handleToggle = (id: number, type: 'RX' | 'TX' | 'XC') => {
        // Directly toggle the specified type without assuming RX/TX dependencies here
        // Let FrequencyCard handle the specifics of those dependencies
        setFrequencyStates((prev) => ({
            ...prev,
            [id]: { ...prev[id], [type]: !prev[id][type] },
        }))
    }

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="20px" minChildWidth="16rem" margin="1rem">
            {initialFrequencies.map((frequency) => (
                <FrequencyCard
                    key={frequency.id}
                    frequency={frequency}
                    frequencyState={frequencyStates[frequency.id]}
                    onToggle={handleToggle}
                />
            ))}
        </SimpleGrid>
    )
}

export default FrequenciesGrid
