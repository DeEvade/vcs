'use client'
import React, { useEffect } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FrequenciesGrid from '@/components/FrequenciesGrid'
import RolesGrid from '../components/RolesGrid'
import RoleSelectionModal from '@/components/RoleSelectionModal'
import { useAppConfig } from '@/contexts/AppConfigContext'
import './globals.css'
import io from 'socket.io-client'

const Page: React.FC = () => {
    const { selectedRole, setSelectedRole } = useAppConfig()

    const onSelectRole = () => {
        // implement logic to make a coordination call
    }

    //Connnect to socket server
    useEffect(() => {
        const socket = io();
        socket.on('connect', () => {
            console.log('connected to socket server');
        });

        socket.on("disconnect", () => {
            console.log("disconnected from socket server");
        });
        
        

    }, []);

    return (
        <Flex direction="column" minH="100vh">
            <Header />
            <Flex flex="1" direction={{ base: 'column', md: 'row' }}>
                <Box w={{ base: '100%', lg: '66%' }} p={2}>
                    <FrequenciesGrid />
                </Box>
                <Box w={{ base: '100%', lg: '33%' }} p={2}>
                    <RolesGrid onSelectRole={onSelectRole} />
                </Box>
            </Flex>
            <Footer />
            {/* Conditionally render RoleSelectionModal */}
            {!selectedRole && <RoleSelectionModal isOpen={true} onClose={() => {}} />}
        </Flex>
    )
}

export default Page
