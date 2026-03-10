import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axios.js';

export default function ProjectSettings() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [projectRes, analyticsRes] = await Promise.allSettled([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/analytics`),
      ]);

      if (projectRes.status === 'fulfilled') {
        const p = projectRes.value.data.project || projectRes.value.data;
        setProject(p);
        setForm({ title: p.title || '', description: p.description || '' });
      }
      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data);
      }
    } catch {
      toast.error('Failed to load project settings.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await api.put(`/projects/${projectId}`, {
        title: form.title.trim(),
        description: form.description.trim(),
      });
      const updated = res.data.project || res.data;
      setProject(updated);
      toast.success('Project updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project.');
      setDeleting(false);
    }
  }

  const stats = analytics
    ? {
        total: analytics.total ?? analytics.totalTasks ?? 0,
        todo: analytics.todo ?? analytics.byStatus?.todo ?? 0,
        inProgress: analytics['in-progress'] ?? analytics.byStatus?.['in-progress'] ?? 0,
        done: analytics.done ?? analytics.byStatus?.done ?? 0,
        completionRate: analytics.completionRate ?? 0,
      }
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex justify-center items-center h-screen">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span>/</span>
          <Link to={`/projects/${projectId}`} className="hover:text-indigo-600">
            {project?.title || 'Project'}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Settings</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Project Settings</h1>

        {/* Edit form */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">General</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input-field resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Analytics */}
        {stats && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Analytics</h2>

            {/* Completion rate */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                <span className="text-sm font-bold text-indigo-600">
                  {Math.round(stats.completionRate)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(stats.completionRate))}%` }}
                />
              </div>
            </div>

            {/* Task counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: stats.total, color: 'bg-gray-100 text-gray-700' },
                { label: 'To Do', value: stats.todo, color: 'bg-gray-100 text-gray-600' },
                { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-100 text-blue-700' },
                { label: 'Done', value: stats.done, color: 'bg-green-100 text-green-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-xl px-4 py-3 ${color}`}>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs mt-0.5 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="card border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h2>
          <p className="text-sm text-red-600 mb-4">
            Deleting this project is permanent and cannot be undone. All tasks and activities
            will be removed.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger"
            >
              Delete Project
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-red-700">Are you sure?</p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
