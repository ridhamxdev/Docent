import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join', (userId: string) => {
            if (userId) {
                socket.join(userId);
                console.log(`Socket ${socket.id} joined room ${userId}`);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const notifyUser = (userId: string, event: string, data: any) => {
    if (io) {
        io.to(userId).emit(event, data);
    }
};
