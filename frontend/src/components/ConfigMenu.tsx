// src/components/ConfigMenu.tsx
import React, { useState, useEffect } from 'react'
import {
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    IconButton,
    useColorMode,
    Text,
    Box,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    keyframes,
    usePrefersReducedMotion,
} from '@chakra-ui/react'
import { SettingsIcon } from '@chakra-ui/icons'
import { MdGraphicEq } from 'react-icons/md'
import { usePTT } from '../contexts/PTTContext'
import { useAppConfig } from '@/contexts/AppConfigContext'

const ConfigMenu: React.FC = () => {
    const [radioGain, setRadioGain] = useState(50)
    const [listeningForKey, setListeningForKey] = useState(false)
    const prefersReducedMotion = usePrefersReducedMotion()
    const { pttKey, setPttKey } = usePTT()
    const { easyMode, setEasyMode } = useAppConfig()

    // Pulsate animation keyframes for the psuh to talk selection button
    const pulsate = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
   `

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (listeningForKey) {
                setPttKey(event.code)
                setListeningForKey(false)
                event.preventDefault() // Prevent default action for key press
            }
        }

        if (listeningForKey) {
            window.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [listeningForKey])

    // Calculate the gain percentage for display
    const displayGain = Math.round((radioGain / 100) * 200) // Convert slider value to percentage

    const animation = prefersReducedMotion ? undefined : `${pulsate} infinite 1.5s ease`

    const handleEasyMode = () => {
        setEasyMode(!easyMode)
    }

    return (
        <Menu>
            <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<SettingsIcon />}
                variant="outline"
                _focus={{ outline: 'none', boxShadow: 'none' }}
                _active={{ outline: 'none' }}
            />
            <MenuList>
                <Box p={4}>
                    <Text mb={2}>Radio Gain: {displayGain}%</Text>
                    <Slider defaultValue={50} min={0} max={100} value={radioGain} onChange={(val) => setRadioGain(val)}>
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb boxSize={5}>
                            <Box color="gray.600" as={MdGraphicEq} />
                        </SliderThumb>
                    </Slider>
                </Box>
                <Box p={4}>
                    <Text mb={2}>Push to Talk Key: {pttKey}</Text>
                    <Button
                        size="sm"
                        onClick={() => setListeningForKey(!listeningForKey)}
                        animation={listeningForKey ? animation : 'none'}
                        _focus={{ outline: 'none', boxShadow: 'none' }}
                        _active={{ outline: 'none' }}
                    >
                        {' '}
                        {/* Explicitly turn off animation */}
                        {listeningForKey ? 'Listening...' : 'Select New Key'}
                    </Button>
                </Box>
                <MenuItem onClick={handleEasyMode} closeOnSelect={false}>
                    Easy Mode: {easyMode ? 'On' : 'Off'}
                </MenuItem>
            </MenuList>
        </Menu>
    )
}

export default ConfigMenu
