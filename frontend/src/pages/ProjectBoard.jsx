import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import ActivityTimeline from '../components/ActivityTimeline'
import SearchFilter from '../components/SearchFilter'
import useSocket from '../hooks/useSocket'
import api from '../api/axios'

const COLUMNS = [
  { id: 'todo', title: 'To-Do', color: 'bg-gray-100', headerColor: 'text-gray-600', dotColor: 'bg-gray-400' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50', headerColor: 'text-blue-600', dotColor: 'bg-blue-400' },
  { id: 'done', title: 'Done', color: 'bg-green-50', headerColor: 'text-green-600', dotColor: 'bg-green-400' },
]

const ProjectBoard = () => {
  const { id: projectId } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [filters, setFilters] = useState({})
  const [selectedTask, setSelectedTask] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDefaultStatus, setModalDefaultStatus] = useState('todo')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [newActivity, setNewActivity] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch project
  useEffect(() => {
    api.get(`/api/projects/${projectId}`)
      .then((res) => setProject(res.data.data.project))
      .catch(() => toast.error('Failed to load project'))
  }, [projectId])

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: 100, ...filters })
      const res = await api.get(`/api/tasks/project/${projectId}?${params}`)
      setTasks(res.data.data.items || [])
    } catch (err) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [projectId, filters])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Socket handlers
  const socketHandlers = {
    onTaskCreated: ({ task }) => {
      setTasks((prev) => {
        if (prev.find((t) => t.id === task.id)) return prev
        return [...prev, task]
      })
    },
    onTaskUpdated: ({ task }) => {
      setTasks((prev) => prev.map((t) => t.id === task.id ? task : t))
    },
    onTaskMoved: ({ task }) => {
      setTasks((prev) => prev.map((t) => t.id === task.id ? task : t))
    },
    onTaskDeleted: ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    },
    onActivityCreated: ({ activity }) => {
      setNewActivity(activity)
    },
  }

  useSocket(projectId, socketHandlers)

  const getColumnTasks = (status) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position)

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const newStatus = destination.droppableId

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus, position: destination.index } : t
      )
    )

    try {
      await api.put(`/api/tasks/${draggableId}/move`, {
        status: newStatus,
        position: destination.index,
      })
    } catch (err) {
      toast.error('Failed to move task')
      fetchTasks()
    }
  }

  const handleTaskSave = (savedTask) => {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === savedTask.id)
      if (exists) return prev.map((t) => t.id === savedTask.id ? savedTask : t)
      return [...prev, savedTask]
    })
  }

  const openAddTask = (status) => {
    setSelectedTask(null)
    setModalDefaultStatus(status)
    setModalOpen(true)
  }

  const openEditTask = (task) => {
    setSelectedTask(task)
    setModalOpen(true)
  }

  const members = project?.owner ? [project.owner] : []

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64 pt-16 flex flex-col h-screen">
        {/* Board header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  {project?.title || 'Loading...'}
                </h1>
                {project?.description && (
                  <p className="text-xs text-gray-400 line-clamp-1">{project.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/projects/${projectId}/settings`}
                className="btn-secondary text-sm py-1.5 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              <button
                onClick={() => setActivityOpen(!activityOpen)}
                className={`btn-secondary text-sm py-1.5 flex items-center gap-1 ${activityOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Activity
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-3">
            <SearchFilter onFilter={handleFilterChange} members={members} />
          </div>
        </div>

        {/* Board body */}
        <div className="flex-1 overflow-hidden flex">
          {/* Kanban columns */}
          <div className="flex-1 overflow-x-auto p-4">
            {loading ? (
              <div className="flex gap-4 h-full">
                {COLUMNS.map((col) => (
                  <div key={col.id} className="w-72 flex-shrink-0 bg-gray-100 rounded-xl p-3 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded mb-4 w-1/2" />
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 mb-2">
                        <div className="h-3 bg-gray-200 rounded mb-2 w-1/3" />
                        <div className="h-4 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 h-full min-h-0">
                  {COLUMNS.map((col) => {
                    const colTasks = getColumnTasks(col.id)
                    return (
                      <div key={col.id} className={`w-72 flex-shrink-0 ${col.color} rounded-xl flex flex-col`}>
                        {/* Column header */}
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                            <h3 className={`font-semibold text-sm ${col.headerColor}`}>{col.title}</h3>
                            <span className="text-xs bg-white bg-opacity-70 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                              {colTasks.length}
                            </span>
                          </div>
                          <button
                            onClick={() => openAddTask(col.id)}
                            className="w-6 h-6 rounded-md hover:bg-white hover:bg-opacity-60 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Droppable area */}
                        <Droppable droppableId={col.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex-1 overflow-y-auto px-3 pb-3 min-h-[100px] transition-colors duration-200
                                ${snapshot.isDraggingOver ? 'bg-indigo-50 bg-opacity-50' : ''}`}
                            >
                              {colTasks.map((task, index) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  index={index}
                                  onClick={openEditTask}
                                />
                              ))}
                              {provided.placeholder}
                              {colTasks.length === 0 && (
                                <div className="text-center py-6">
                                  <p className="text-xs text-gray-400">Drop tasks here</p>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>

                        {/* Add task button */}
                        <button
                          onClick={() => openAddTask(col.id)}
                          className="m-3 mt-0 py-2 text-sm text-gray-400 hover:text-indigo-600 hover:bg-white hover:bg-opacity-60 rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add task
                        </button>
                      </div>
                    )
                  })}
                </div>
              </DragDropContext>
            )}
          </div>

          {/* Activity sidebar */}
          {activityOpen && (
            <div className="w-72 flex-shrink-0 bg-white border-l border-gray-200 p-4 overflow-y-auto">
              <ActivityTimeline projectId={projectId} newActivity={newActivity} />
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTask(null) }}
        task={selectedTask}
        projectId={projectId}
        onSave={handleTaskSave}
        defaultStatus={modalDefaultStatus}
      />
    </div>
  )
}

export default ProjectBoard
