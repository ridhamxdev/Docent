import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// For physical devices, you must use your machine's local IP address (e.g., 192.168.1.x)
const getBaseUrl = () => {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;

    if (envUrl && envUrl !== '') {
        return envUrl;
    }

    // Default fallbacks if no env var is set
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5555';
    }

    return 'http://localhost:5555';
};

const API_URL = getBaseUrl();

export const apiClient = {
    get: async <T = any>(endpoint: string): Promise<T> => {
        try {
            const res = await fetch(`${API_URL}${endpoint}`, { cache: 'no-store' });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`API Request Failed: ${res.status} ${errorText}`);
            }
            return res.json();
        } catch (error) {
            console.error(`GET request failed for ${endpoint}:`, error);
            throw error;
        }
    },

    post: async (endpoint: string, body: any, options: { headers?: Record<string, string> } = {}) => {
        const isFormData = body instanceof FormData;

        const headers: Record<string, string> = { ...options.headers };
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: isFormData ? body : JSON.stringify(body),
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`API Request Failed: ${res.status} ${errorText}`);
            }
            return res.json();
        } catch (error) {
            console.error(`POST request failed for ${endpoint}:`, error);
            throw error;
        }
    },

    upload: async (file: any, folder: string = 'misc') => { // file type is any because React Native file obj is different
        const formData = new FormData();
        // React Native FormData expects specific object structure for files
        // { uri, name, type }
        // We assume 'file' passed here already matches that structure or we adapt it
        formData.append('file', file as any);
        formData.append('folder', folder);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data', // Often not needed for fetch with FormData, but good to be aware
                },
            });

            if (!res.ok) throw new Error('Upload Failed');
            return res.json();
        } catch (error) {
            console.error(`Upload failed:`, error);
            throw error;
        }
    },

    delete: async (endpoint: string, body?: any) => {
        try {
            const options: RequestInit = {
                method: 'DELETE',
            };

            if (body) {
                options.headers = { 'Content-Type': 'application/json' };
                options.body = JSON.stringify(body);
            }

            const res = await fetch(`${API_URL}${endpoint}`, options);
            if (!res.ok) throw new Error('API Request Failed');
            return res.json();
        } catch (error) {
            console.error(`DELETE request failed for ${endpoint}:`, error);
            throw error;
        }
    },

    put: async (endpoint: string, body: any) => {
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('API Request Failed');
            return res.json();
        } catch (error) {
            console.error(`PUT request failed for ${endpoint}:`, error);
            throw error;
        }
    }
};
