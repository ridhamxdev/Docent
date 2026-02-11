const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

export const apiClient = {
    get: async <T = any>(endpoint: string): Promise<T> => {
        const res = await fetch(`${API_URL}${endpoint}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('API Request Failed');
        return res.json();
    },

    post: async (endpoint: string, body: any, options: { headers?: Record<string, string> } = {}) => {
        const isFormData = body instanceof FormData;

        const headers: Record<string, string> = { ...options.headers };
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: isFormData ? body : JSON.stringify(body),
        });
        if (!res.ok) throw new Error('API Request Failed');
        return res.json();
    },

    upload: async (file: File, folder: string = 'misc') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Upload Failed');
        return res.json(); // Expected { url: "..." }
    },

    delete: async (endpoint: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('API Request Failed');
        return res.json();
    },

    put: async (endpoint: string, body: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('API Request Failed');
        return res.json();
    }
};
