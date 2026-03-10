import React from 'react';
import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const id = project._id || project.id;
  const taskCount = project.taskCount ?? project.tasks?.length ?? 0;

  const createdDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow duration-200">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{project.title}</h3>
        {project.description ? (
          <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">No description</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </span>
          {createdDate && (
            <span className="text-xs text-gray-400">{createdDate}</span>
          )}
        </div>
        <Link
          to={`/projects/${id}`}
          className="btn-primary text-sm py-1.5 px-3"
        >
          Open Board
        </Link>
      </div>
    </div>
  );
}
