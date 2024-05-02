// src/components/RoleSelectionModal.tsx
import React, { useState } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    HStack,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react'
import { useAppConfig } from '@/contexts/AppConfigContext'
import RolesGrid from './RolesGrid'

interface RoleSelectionModalProps {
    isOpen: boolean
    onClose: () => void
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ isOpen, onClose }) => {
    const { setSelectedRole } = useAppConfig()
    const [atcoSelected, setAtcoSelected] = useState(false)
    const atcoButtonColor = useColorModeValue('green', 'teal')

    const handleATCOSelection = () => {
        setAtcoSelected(true)
    }

    const handlePilotSelection = () => {
        setSelectedRole('PILOT')
        onClose()
    }

    const handleRoleSelection = (roleName: string) => {
        setSelectedRole(roleName)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
            <ModalOverlay />
            <ModalContent
                mx={4} // Margin on the x-axis for smaller screens
                width="60%" // A fixed width for all screen sizes
                height="60vh" // A fixed height based on viewport height
                sx={{
                    minWidth: '60vh', // Ensures modal has a minimum width regardless of content
                    minHeight: '30vh', // Ensures modal has a minimum height regardless of content
                }}
            >
                <ModalHeader>Select Role</ModalHeader>
                <ModalBody>
                    <VStack spacing={4}>
                        <HStack spacing={4} marginBottom="2rem">
                            <Button
                                colorScheme={atcoSelected ? atcoButtonColor : undefined}
                                onClick={handleATCOSelection}
                                w="6rem"
                                h="4rem"
                                p={2}
                            >
                                ATCO
                            </Button>
                            <Button w="6rem" h="4rem" p={2} onClick={handlePilotSelection}>
                                PILOT
                            </Button>
                        </HStack>
                    </VStack>
                    {atcoSelected && <RolesGrid onSelectRole={handleRoleSelection} />}
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default RoleSelectionModal
