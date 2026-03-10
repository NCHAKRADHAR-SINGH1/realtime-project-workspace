import React from 'react';
import { Link, useParams } from 'react-router-dom';

export default function Sidebar({ projects = [], onNewProject }) {
  const { id: activeId } = useParams();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col pt-16">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
          Projects
        </h2>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-400 px-2">No projects yet</p>
        ) : (
          <ul className="space-y-1">
            {projects.map((project) => (
              <li key={project._id || project.id}>
                <Link
                  to={`/projects/${project._id || project.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    activeId === (project._id || project.id)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span className="truncate">{project.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={onNewProject}
          className="w-full btn-primary text-sm flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          New Project
        </button>
      </div>
    </aside>
  );
}
