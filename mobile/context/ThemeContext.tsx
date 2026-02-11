import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
    isDarkMode: boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    isDarkMode: false,
    toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { colorScheme, setColorScheme } = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

    useEffect(() => {
        // Load persisted preference
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('theme');
                if (storedTheme) {
                    setColorScheme(storedTheme as 'light' | 'dark');
                    setIsDarkMode(storedTheme === 'dark');
                }
            } catch (error) {
                console.error('Failed to load theme preference', error);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setColorScheme(newTheme);
        setIsDarkMode(!isDarkMode);
        try {
            await AsyncStorage.setItem('theme', newTheme);
        } catch (error) {
            console.error('Failed to save theme preference', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
