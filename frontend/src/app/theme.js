'use client'
// theme.js
import { extendTheme } from '@chakra-ui/react';

const config = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
};

const theme = extendTheme({
    config,
    fonts: {
        heading: 'B612, sans-serif',
        body: 'B612, sans-serif',
    },
    colors: {
        gray: {
            50: '#F7FAFC',
            100: '#EDF2F7',
            200: '#E2E8F0',
            300: '#CBD5E0',
            400: '#A0AEC0',
            500: '#718096', // Mid gray for secondary text/icons
            600: '#4A5568', // Slightly darker gray, good for less emphasized elements
            700: '#2D3748', // Darker still, for subtle borders or inactive elements
            800: '#1A202C', // Your primary dark mode color
            900: '#171923', // Even darker, for the deepest contrasts
        },
        // Define other color scales or specific colors as needed
    },
});

export default theme

