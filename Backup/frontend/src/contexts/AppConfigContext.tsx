// src/contexts/AppConfigContext.tsx
'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

// Define the shape of your context state
interface AppConfigContextType {
    selectedRole: string
    setSelectedRole: (role: string) => void
    easyMode: boolean
    setEasyMode: (mode: boolean) => void
    // Add other settings as needed
}

// Create the context with an initial empty state
const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined)

// Create a provider component
export const AppConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedRole, setSelectedRole] = useState<string>('')
    const [easyMode, setEasyMode] = useState<boolean>(false)

    // Provide the state and setters for your context
    const value = {
        selectedRole,
        setSelectedRole,
        easyMode,
        setEasyMode,
    }

    return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>
}

// Hook to use the AppConfig context
export const useAppConfig = () => {
    const context = useContext(AppConfigContext)
    if (context === undefined) {
        throw new Error('useAppConfig must be used within an AppConfigProvider')
    }
    return context
}
