import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

const ProjectSettings = () => {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, analyticsRes] = await Promise.all([
          api.get(`/api/projects/${projectId}`),
          api.get(`/api/projects/${projectId}/analytics`),
        ])
        const p = projRes.data.data.project
        setProject(p)
        setFormData({ title: p.title, description: p.description || '' })
        setAnalytics(analyticsRes.data.data)
      } catch (err) {
        toast.error('Failed to load project settings')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [projectId])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/api/projects/${projectId}`, formData)
      setProject((prev) => ({ ...prev, ...formData }))
      toast.success('Project updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/projects/${projectId}`)
      toast.success('Project deleted')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project')
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64 pt-16">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link to={`/projects/${projectId}`} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="h-10 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Edit form */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">General</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field max-w-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field max-w-lg resize-none"
                      rows={3}
                    />
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              {/* Analytics */}
              {analytics && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>

                  {/* Completion */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Completion</span>
                      <span className="text-sm font-bold text-indigo-600">{analytics.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${analytics.completionPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{analytics.total} total tasks</p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-600">{analytics.tasksByStatus.todo}</div>
                      <div className="text-xs text-gray-400 mt-1">To-Do</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{analytics.tasksByStatus['in-progress']}</div>
                      <div className="text-xs text-gray-400 mt-1">In Progress</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{analytics.tasksByStatus.done}</div>
                      <div className="text-xs text-gray-400 mt-1">Done</div>
                    </div>
                  </div>

                  {/* Priority breakdown */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">By Priority</h3>
                    <div className="space-y-2">
                      {[
                        { key: 'high', label: 'High', color: 'bg-red-500', textColor: 'text-red-600' },
                        { key: 'medium', label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
                        { key: 'low', label: 'Low', color: 'bg-green-500', textColor: 'text-green-600' },
                      ].map(({ key, label, color, textColor }) => {
                        const count = analytics.tasksByPriority[key] || 0
                        const pct = analytics.total > 0 ? (count / analytics.total) * 100 : 0
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <span className={`text-xs font-medium w-12 ${textColor}`}>{label}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Danger zone */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Permanently delete this project and all its tasks. This cannot be undone.
                </p>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="btn-danger"
                  >
                    Delete Project
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-red-600 font-medium">Are you sure?</p>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="btn-danger text-sm"
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectSettings
