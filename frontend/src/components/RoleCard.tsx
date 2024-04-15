// src/components/RoleCard.tsx
'use client'
import { Box, Button, Center, Text, VStack } from '@chakra-ui/react'

interface RoleCardProps {
    roleName: string
    onClick: () => void
}

const RoleCard: React.FC<RoleCardProps> = ({ roleName, onClick }) => {
    // Split the roleName into the first word and the rest
    const firstSpaceIndex = roleName.indexOf(' ')
    const firstWord = roleName.substring(0, firstSpaceIndex)
    const restOfName = roleName.substring(firstSpaceIndex + 1)

    return (
        <Box w="6rem" h="6rem" p={2}>
            {' '}
            {/* Adjust w and h as per design */}
            <Center w="100%" h="100%">
                <Button onClick={onClick} width="100%" height="100%">
                    <VStack>
                        {/* Display the first word */}
                        <Text fontSize="sm">{firstWord}</Text>
                        {/* Display the rest of the name */}
                        <Text fontSize="sm">{restOfName}</Text>
                    </VStack>
                </Button>
            </Center>
        </Box>
    )
}

export default RoleCard
