import { useNavigate } from 'react-router-dom'

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const ProjectCard = ({ project }) => {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="card cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
          {project.title.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {project.tasks?.length || 0} tasks
        </span>
      </div>

      {/* Title & Description */}
      <h3 className="font-semibold text-gray-900 text-base mb-1 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-1">
        {project.title}
      </h3>
      {project.description && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {project.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        {project.owner && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {project.owner.avatar ? (
                <img src={project.owner.avatar} alt={project.owner.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                getInitials(project.owner.name)
              )}
            </div>
            <span className="text-xs text-gray-400 truncate max-w-[100px]">{project.owner.name}</span>
          </div>
        )}
        <span className="text-xs text-gray-300">
          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  )
}

export default ProjectCard
