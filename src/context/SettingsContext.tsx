import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SFCConfig } from '../types';

const DEFAULT_CONFIG: SFCConfig = {
    STATION_ID: import.meta.env.VITE_DEFAULT_STATION_ID || 'PRET_05',
    PROJECT: import.meta.env.VITE_DEFAULT_PROJECT || 'NV_VR200',
    EMP_NO: import.meta.env.VITE_DEFAULT_EMP_NO || 'T80969',
    MODEL_NAME: import.meta.env.VITE_DEFAULT_MODEL_NAME || 'NV_VR200',
};

interface SettingsContextType {
    settings: SFCConfig;
    updateSettings: (newSettings: Partial<SFCConfig>) => void;
    resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SFCConfig>(() => {
        const saved = localStorage.getItem('sfc-settings');
        return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    });

    useEffect(() => {
        localStorage.setItem('sfc-settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings: Partial<SFCConfig>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_CONFIG);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
