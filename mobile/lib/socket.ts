import { io, Socket } from 'socket.io-client';
// import { apiClient } from './apiClient';

// Use same URL as apiClient but ensure no path unless socket.io is mounted there
// Removing '/api' if present, though usually socket.io mounts on root
// Use EXPO_PUBLIC_API_URL from env, fallback to localhost
const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5555';

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        transports: ['websocket'], // Force WebSocket
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
        socket?.emit('join', userId);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('connect_error', (err: Error) => {
        console.log('Socket connection error', err);
    });

    return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
