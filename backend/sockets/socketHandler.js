const jwt = require('jsonwebtoken');

const setupSocketHandler = (io) => {
  // JWT authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new Error('Authentication error: Token has expired'));
      }
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.user.name} (${socket.user.id}) [${socket.id}]`);

    socket.on('join-project', (projectId) => {
      if (!projectId) return;
      const room = `project:${projectId}`;
      socket.join(room);
      console.log(`[Socket] ${socket.user.name} joined room: ${room}`);
      socket.emit('joined-project', { projectId, room });
    });

    socket.on('leave-project', (projectId) => {
      if (!projectId) return;
      const room = `project:${projectId}`;
      socket.leave(room);
      console.log(`[Socket] ${socket.user.name} left room: ${room}`);
      socket.emit('left-project', { projectId, room });
    });

    socket.on('disconnect', (reason) => {
      console.log(
        `[Socket] User disconnected: ${socket.user.name} (${socket.user.id}) - Reason: ${reason}`
      );
    });

    socket.on('error', (err) => {
      console.error(`[Socket] Error for user ${socket.user?.name}:`, err.message);
    });
  });
};

module.exports = { setupSocketHandler };
