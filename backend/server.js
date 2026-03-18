const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("JOIN", ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = [...(io.sockets.adapter.rooms.get(roomId) || [])].map(
      (socketId) => ({
        socketId,
        username: userSocketMap[socketId],
      })
    );

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("JOINED", {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on("CODE_CHANGE", ({ roomId, code }) => {
    socket.in(roomId).emit("CODE_CHANGE", { code });
  });

  socket.on("SEND_MESSAGE", ({ roomId, message, username }) => {
    socket.in(roomId).emit("RECEIVE_MESSAGE", {
      message,
      username,
    });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];

    rooms.forEach((roomId) => {
      socket.in(roomId).emit("DISCONNECTED", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});