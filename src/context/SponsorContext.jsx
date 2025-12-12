// context/SponsorContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const SponsorContext = createContext();

// Define the default theme based on your Tailwind colors
const DEFAULT_THEME = {
    isActive: false,
    sponsorName: 'KindnessConnect',
    logoUrl: '',
    websiteUrl: '',
    // Original Brand Colors (brand-300 and brand-50 from tailwind.config)
    primary_color_hex: '#FD7979', 
    light_bg_hex: '#FEEAC9',     
};

export const SponsorProvider = ({ children }) => {
    const [theme, setTheme] = useState(DEFAULT_THEME);
    const [loading, setLoading] = useState(true);

    const fetchActiveTheme = async () => {
        try {
            const response = await api.get('/sponsors/active');
            const activeSponsor = response.data;

            if (activeSponsor) {
                setTheme({
                    isActive: true,
                    sponsorName: activeSponsor.sponsor_name,
                    logoUrl: activeSponsor.logo_url,
                    websiteUrl: activeSponsor.website_url,
                    primary_color_hex: activeSponsor.primary_color_hex || DEFAULT_THEME.primary_color_hex,
                    light_bg_hex: activeSponsor.light_bg_hex || DEFAULT_THEME.light_bg_hex,
                });
            } else {
                setTheme(DEFAULT_THEME);
            }
        } catch (error) {
            console.error("Failed to fetch active sponsor theme, using default colors.", error);
            setTheme(DEFAULT_THEME);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveTheme();
    }, []);

    // Allows admin components to manually update or refresh the theme state
    const updateTheme = (newTheme) => setTheme(newTheme);

    return (
        <SponsorContext.Provider value={{ theme, loading, updateTheme, fetchActiveTheme }}>
            {children}
        </SponsorContext.Provider>
    );
};

export const useSponsor = () => {
    return useContext(SponsorContext);
};