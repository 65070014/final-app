const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
        socket.to(roomId).emit('user_joined', socket.id);
    });
    socket.on('offer', (data) => {
        console.log("Relaying offer...");
        socket.to(data.roomId).emit('offer', data.offer);
    });
    socket.on('answer', (data) => {
        console.log("Relaying answer...");
        socket.to(data.roomId).emit('answer', data.answer);
    });
    socket.on('candidate', (data) => {
        console.log("Relaying candidate...");
        socket.to(data.roomId).emit('candidate', data.candidate);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
server.listen(3001, () => {
    console.log('Signaling Server running on http://localhost:3001');
});