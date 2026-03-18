import { io } from "socket.io-client";

export const initSocket = async () => {
  return io({
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    timeout: 10000,
  });
};