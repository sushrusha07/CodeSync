const express = require("express");
const app = express();

const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const ACTIONS = require("./src/actions/Actions");

const server = http.createServer(app);

// ✅ IMPORTANT CORS FIX
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.static("build"));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    console.log("JOIN RECEIVED:", roomId, username);
    userSocketMap[socket.id] = username;

    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    console.log("Clients in room:", clients); // ✅ DEBUG

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // ✅ FIXED
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.CURSOR_POSITION, ({ roomId, cursor, username }) => {
    socket.in(roomId).emit(ACTIONS.CURSOR_UPDATE, {
      cursor,
      username,
    });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // CHAT
  socket.on(ACTIONS.SEND_MESSAGE, ({ roomId, message, username }) => {
    io.in(roomId).emit(ACTIONS.RECEIVE_MESSAGE, {
      message,
      username,
    });
  });

  // DISCONNECT
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];

    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});