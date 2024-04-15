// src/contexts/PTTContext.tsx
// A react context for the push to talk state
'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface PTTContextType {
    pttKey: string
    setPttKey: (key: string) => void
    pttActive: boolean
}

const PTTContext = createContext<PTTContextType | undefined>(undefined)

export const usePTT = () => {
    const context = useContext(PTTContext)
    if (context === undefined) {
        throw new Error('usePTT must be used within a PTTProvider')
    }
    return context
}

interface PTTProviderProps {
    children: ReactNode // Define the children prop to accept ReactNode
}

export const PTTProvider: React.FC<PTTProviderProps> = ({ children }) => {
    const [pttKey, setPttKey] = useState('Space')
    const [pttActive, setPttActive] = useState(false)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === ' ') {
                event.preventDefault()
            }
            if (event.code === pttKey) {
                setPttActive(true)
            }
        }

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.code === pttKey) {
                setPttActive(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [pttKey])

    return <PTTContext.Provider value={{ pttKey, setPttKey, pttActive }}>{children}</PTTContext.Provider>
}
