import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(projectId) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    socketRef.current = socket;

    if (projectId) {
      socket.emit('join-project', projectId);
    }

    return () => {
      if (projectId) {
        socket.emit('leave-project', projectId);
      }
      socket.disconnect();
    };
  }, [projectId]);

  return socketRef.current;
}
