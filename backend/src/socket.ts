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
        console.log(`🔌 Emitting '${event}' to room '${userId}'`);
        io.to(userId).emit(event, data);

        // Log how many clients are in this room
        const room = io.sockets.adapter.rooms.get(userId);
        console.log(`📊 Room '${userId}' has ${room?.size || 0} client(s)`);
    } else {
        console.error('❌ Socket.io not initialized, cannot notify user');
    }
};
