// src/components/RolesGrid.tsx
import React from 'react'
import { Box, SimpleGrid } from '@chakra-ui/react'
import RoleCard from './RoleCard'
import { Role } from '@/types'

interface RolesGridProps {
    onSelectRole: (roleName: string) => void // Adding a new prop for role selection
}

// Some hardcoded roles
const initialRoles: Role[] = [
    { name: 'OS DIR-E', primaryFrequency: '120.505' },
    { name: 'OS ARR-E', primaryFrequency: '126.655' },
    { name: 'OS APP-C', primaryFrequency: '' },
    { name: 'OS P3', primaryFrequency: '131.130' },
    { name: 'SA TWR W', primaryFrequency: '118.505' },
    // Add more as needed
]

const RolesGrid: React.FC<RolesGridProps> = ({ onSelectRole }) => {
    return (
        <Box p={2}>
            <SimpleGrid
                minChildWidth="4.4rem"
                spacing={4}
                boxShadow="md"
                border="1px"
                borderColor="gray.500"
                padding="1rem"
                marginRight="2rem"
            >
                {initialRoles.map((role) => (
                    <RoleCard key={role.name} roleName={role.name} onClick={() => onSelectRole(role.name)} />
                ))}
            </SimpleGrid>
        </Box>
    )
}

export default RolesGrid
