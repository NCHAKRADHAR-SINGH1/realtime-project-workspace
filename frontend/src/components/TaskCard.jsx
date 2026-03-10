import { Draggable } from '@hello-pangea/dnd'

const priorityConfig = {
  low: { label: 'Low', className: 'bg-green-100 text-green-700' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', className: 'bg-red-100 text-red-700' },
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  const now = new Date()
  const isOverdue = d < now
  return {
    text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue,
  }
}

const TaskCard = ({ task, index, onClick }) => {
  const priority = priorityConfig[task.priority] || priorityConfig.medium
  const dueDate = formatDate(task.dueDate)

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-white rounded-lg shadow-sm p-3 mb-2 cursor-pointer hover:shadow-md transition-all duration-200 border border-transparent
            ${snapshot.isDragging ? 'shadow-lg rotate-2 border-indigo-300' : 'hover:border-indigo-200'}`}
        >
          {/* Priority badge */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.className}`}>
              {priority.label}
            </span>
            {task.attachment && (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-gray-800 mb-2 leading-snug line-clamp-2">
            {task.title}
          </h4>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            {/* Due date */}
            {dueDate ? (
              <span className={`text-xs ${dueDate.isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {dueDate.isOverdue ? '⚠ ' : '📅 '}{dueDate.text}
              </span>
            ) : (
              <span />
            )}

            {/* Assignee */}
            {task.assignee && (
              <div
                className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold"
                title={task.assignee.name}
              >
                {task.assignee.avatar ? (
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  getInitials(task.assignee.name)
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}

export default TaskCard
