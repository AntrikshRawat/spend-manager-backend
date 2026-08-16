const { Server } = require('socket.io');
const CLOUD_HOST = process.env.CLOUD_HOST;
let io = null;

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: CLOUD_HOST,
        credentials: true
      }
    });

    io.on("connection", (socket) => {

      socket.on("join_room", (roomId) => {
        socket.join(roomId);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
