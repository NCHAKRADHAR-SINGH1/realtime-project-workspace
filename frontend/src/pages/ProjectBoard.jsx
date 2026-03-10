import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ActivityTimeline from '../components/ActivityTimeline.jsx';
import SearchFilter from '../components/SearchFilter.jsx';
import api from '../api/axios.js';
import useSocket from '../hooks/useSocket.js';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100 border-gray-300' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { id: 'done', label: 'Done', color: 'bg-green-50 border-green-200' },
];

export default function ProjectBoard() {
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [filters, setFilters] = useState({ search: '', priority: '', status: '' });
  const [showActivityPanel, setShowActivityPanel] = useState(true);
  const [taskModal, setTaskModal] = useState({ isOpen: false, task: null, defaultStatus: 'todo' });
  const socket = useSocket(projectId);
  const socketRef = useRef(null);

  // Fetch project details
  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data.project || res.data);
    } catch {
      toast.error('Failed to load project.');
    }
  }, [projectId]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data.tasks || res.data || []);
    } catch {
      toast.error('Failed to load tasks.');
    } finally {
      setLoadingTasks(false);
    }
  }, [projectId]);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    try {
      const res = await api.get(`/activities/project/${projectId}`);
      setActivities(res.data.activities || res.data || []);
    } catch {
      // Activities failing is non-critical
    } finally {
      setLoadingActivities(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchActivities();
  }, [fetchProject, fetchTasks, fetchActivities]);

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;
    socketRef.current = socket;

    socket.on('task-created', (task) => {
      setTasks((prev) => {
        if (prev.find((t) => (t._id || t.id) === (task._id || task.id))) return prev;
        return [...prev, task];
      });
    });

    socket.on('task-updated', (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) =>
          (t._id || t.id) === (updatedTask._id || updatedTask.id) ? updatedTask : t
        )
      );
    });

    socket.on('task-moved', ({ taskId, status }) => {
      setTasks((prev) =>
        prev.map((t) =>
          (t._id || t.id) === taskId ? { ...t, status } : t
        )
      );
    });

    socket.on('task-deleted', ({ taskId }) => {
      setTasks((prev) =>
        prev.filter((t) => (t._id || t.id) !== taskId)
      );
    });

    socket.on('activity-created', (activity) => {
      setActivities((prev) => [...prev, activity]);
    });

    return () => {
      socket.off('task-created');
      socket.off('task-updated');
      socket.off('task-moved');
      socket.off('task-deleted');
      socket.off('activity-created');
    };
  }, [socket]);

  // Drag & drop
  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => ((t._id || t.id) === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/tasks/${draggableId}/move`, { status: newStatus });
    } catch {
      toast.error('Failed to move task.');
      fetchTasks(); // revert by re-fetching
    }
  }

  // Save task (create or update)
  async function handleSaveTask(formData, formValues) {
    try {
      if (taskModal.task) {
        const taskId = taskModal.task._id || taskModal.task.id;
        const res = await api.put(`/tasks/${taskId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updated = res.data.task || res.data;
        setTasks((prev) =>
          prev.map((t) => ((t._id || t.id) === taskId ? updated : t))
        );
        toast.success('Task updated!');
      } else {
        const res = await api.post('/tasks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const created = res.data.task || res.data;
        setTasks((prev) => [...prev, created]);
        toast.success('Task created!');
      }
      setTaskModal({ isOpen: false, task: null, defaultStatus: 'todo' });
      fetchActivities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task.');
    }
  }

  // Filtered tasks per column
  function getColumnTasks(status) {
    return tasks.filter((t) => {
      const matchStatus = t.status === status;
      const matchSearch =
        !filters.search ||
        t.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(filters.search.toLowerCase());
      const matchPriority = !filters.priority || t.priority === filters.priority;
      const matchFilterStatus = !filters.status || t.status === filters.status;
      return matchStatus && matchSearch && matchPriority && matchFilterStatus;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16 flex flex-col h-screen">
        {/* Board header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
              ← Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-lg font-bold text-gray-900">
              {project?.title || 'Loading…'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${projectId}/settings`}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              ⚙️ Settings
            </Link>
            <button
              onClick={() => setShowActivityPanel((v) => !v)}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              {showActivityPanel ? '⟩ Hide Activity' : '⟨ Activity'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex-shrink-0">
          <SearchFilter
            filters={filters}
            onSearch={(val) => setFilters((f) => ({ ...f, search: val }))}
            onFilter={(updated) => setFilters(updated)}
          />
        </div>

        {/* Board + Activity Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Kanban board */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            {loadingTasks ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-5 h-full min-w-max">
                  {COLUMNS.map((col) => {
                    const colTasks = getColumnTasks(col.id);
                    return (
                      <div
                        key={col.id}
                        className="flex flex-col w-72 bg-gray-100 rounded-xl border border-gray-200"
                      >
                        {/* Column header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-sm text-gray-800">
                              {col.label}
                            </h2>
                            <span className="text-xs bg-white text-gray-500 border border-gray-300 rounded-full px-2 py-0.5">
                              {colTasks.length}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setTaskModal({
                                isOpen: true,
                                task: null,
                                defaultStatus: col.id,
                              })
                            }
                            className="text-indigo-600 hover:bg-indigo-50 rounded-lg w-7 h-7 flex items-center justify-center text-lg font-bold transition-colors"
                            title="Add task"
                          >
                            +
                          </button>
                        </div>

                        {/* Droppable */}
                        <Droppable droppableId={col.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors duration-150 ${
                                snapshot.isDraggingOver ? 'bg-indigo-50' : ''
                              }`}
                              style={{ minHeight: '100px' }}
                            >
                              {colTasks.map((task, index) => (
                                <TaskCard
                                  key={task._id || task.id}
                                  task={task}
                                  index={index}
                                  onClick={(t) =>
                                    setTaskModal({ isOpen: true, task: t, defaultStatus: col.id })
                                  }
                                />
                              ))}
                              {provided.placeholder}
                              {colTasks.length === 0 && !snapshot.isDraggingOver && (
                                <p className="text-xs text-gray-400 text-center py-4">
                                  No tasks here
                                </p>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </DragDropContext>
            )}
          </div>

          {/* Activity panel */}
          {showActivityPanel && (
            <aside className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
              <ActivityTimeline
                activities={activities}
                loading={loadingActivities}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModal.isOpen}
        onClose={() => setTaskModal({ isOpen: false, task: null, defaultStatus: 'todo' })}
        onSave={handleSaveTask}
        task={taskModal.task}
        projectId={projectId}
      />
    </div>
  );
}
