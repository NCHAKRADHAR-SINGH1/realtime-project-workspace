import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../api/axios'

const Sidebar = ({ isOpen, onClose }) => {
  const [projects, setProjects] = useState([])
  const location = useLocation()

  useEffect(() => {
    api.get('/api/projects?limit=20')
      .then((res) => setProjects(res.data.data.items || []))
      .catch(() => {})
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-gray-50 border-r border-gray-200 z-40 transition-transform duration-300 overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-4">
          <Link
            to="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 mb-1
              ${isActive('/dashboard') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
            Dashboard
          </Link>

          <div className="mt-4 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Projects
            </h3>
          </div>

          {projects.length === 0 ? (
            <p className="text-sm text-gray-400 px-3 py-2">No projects yet</p>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                onClick={onClose}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 mb-1 truncate
                  ${isActive(`/projects/${project.id}`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                <span className="truncate">{project.title}</span>
              </Link>
            ))
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
