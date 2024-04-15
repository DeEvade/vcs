// src/compontens/FrequencyCard.tsx
'use client'
import React from 'react'
import { Box, Button, Text, Grid, GridItem, useColorMode } from '@chakra-ui/react'
import { usePTT } from '../contexts/PTTContext'
import { useAppConfig } from '@/contexts/AppConfigContext'

interface Frequency {
    id: number
    frequency: string
    label: string
}

interface FrequencyState {
    RX: boolean
    TX: boolean
    XC: boolean
}

interface Props {
    frequency: Frequency
    frequencyState: FrequencyState
    onToggle: (id: number, type: 'RX' | 'TX' | 'XC') => void
}

const FrequencyCard: React.FC<Props> = ({ frequency, frequencyState, onToggle }) => {
    const { colorMode } = useColorMode()
    const bgColor = colorMode === 'light' ? 'gray.200' : 'gray.800'
    const { pttActive } = usePTT()
    const { easyMode } = useAppConfig()

    const handleToggle = (type: 'RX' | 'TX' | 'XC') => {
        if (type === 'RX') {
            // If RX is active and TX is also active, deactivate both.
            if (frequencyState.RX && frequencyState.TX) {
                onToggle(frequency.id, 'RX') // Deactivate RX
                onToggle(frequency.id, 'TX') // Deactivate TX
            } else if (frequencyState.RX) {
                // If only RX is active (and TX is not), just deactivate RX.
                onToggle(frequency.id, 'RX')
            } else {
                // If RX is not active, activate it.
                onToggle(frequency.id, 'RX')
            }
        } else if (type === 'TX') {
            // Activating TX should always activate RX if it's not already active.
            if (!frequencyState.RX) {
                onToggle(frequency.id, 'RX')
            }
            onToggle(frequency.id, 'TX')
        } else if (type === 'XC') {
            onToggle(frequency.id, 'XC')
        }
    }

    // Determine button color based on PTTActive state and button state
    const getButtonColorScheme = (buttonType: 'RX' | 'TX' | 'XC') => {
        const buttonActive = frequencyState[buttonType]
        const isPTTActive = pttActive && buttonActive
        if (buttonType == 'XC') {
            return buttonActive ? 'green' : 'gray'
        } else if (buttonType == 'RX' && frequencyState['TX'] == false && pttActive) {
            return buttonActive ? 'green' : 'gray'
        }
        return isPTTActive ? 'yellow' : buttonActive ? 'green' : 'gray'
    }

    return (
        <Box p={4} borderRadius="lg" border="1px" borderColor="gray.500" bg={bgColor}>
            <Grid templateRows="repeat(2, 1fr)" templateColumns="repeat(2, 1fr)" gap={1}>
                <GridItem colSpan={1}>
                    <Text fontSize="xl">{frequency.frequency}</Text>
                    <Text fontSize="sm" minHeight="20px" style={{ visibility: easyMode ? 'visible' : 'hidden' }}>
                        {frequency.label}
                    </Text>
                </GridItem>

                <GridItem colSpan={1}>
                    <Button
                        colorScheme={getButtonColorScheme('RX')}
                        _focus={{ outline: 'none', boxShadow: 'none' }}
                        _active={{ outline: 'none' }}
                        onClick={() => handleToggle('RX')}
                        width="100%"
                        height="100%"
                    >
                        RX
                    </Button>
                </GridItem>

                <GridItem colSpan={1} width="50%">
                    <Button
                        colorScheme={getButtonColorScheme('XC')}
                        _focus={{ outline: 'none', boxShadow: 'none' }}
                        _active={{ outline: 'none' }}
                        onClick={() => handleToggle('XC')}
                        width="100%"
                        height="100%"
                    >
                        XC
                    </Button>
                </GridItem>

                <GridItem colSpan={1}>
                    <Button
                        colorScheme={getButtonColorScheme('TX')}
                        _focus={{ outline: 'none', boxShadow: 'none' }}
                        _active={{ outline: 'none' }}
                        onClick={() => handleToggle('TX')}
                        width="100%"
                        height="100%"
                    >
                        TX
                    </Button>
                </GridItem>
            </Grid>
        </Box>
    )
}

export default FrequencyCard
