import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

const useSocket = (projectId, handlers = {}) => {
  const { token } = useAuth()
  const socketRef = useRef(null)
  const handlersRef = useRef(handlers)

  // Keep handlers ref up-to-date so socket listeners always call the latest version
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  useEffect(() => {
    if (!token || !projectId) return

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join-project', projectId)
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })

    // Register handlers via refs to avoid stale closures
    socket.on('task-created', (data) => handlersRef.current.onTaskCreated?.(data))
    socket.on('task-updated', (data) => handlersRef.current.onTaskUpdated?.(data))
    socket.on('task-moved', (data) => handlersRef.current.onTaskMoved?.(data))
    socket.on('task-deleted', (data) => handlersRef.current.onTaskDeleted?.(data))
    socket.on('activity-created', (data) => handlersRef.current.onActivityCreated?.(data))

    return () => {
      socket.emit('leave-project', projectId)
      socket.disconnect()
    }
  }, [token, projectId])

  return socketRef
}

export default useSocket
