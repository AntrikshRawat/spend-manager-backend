let io = null;

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: ["https://spend-manager-f.vercel.app","http://localhost:5173"],
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
