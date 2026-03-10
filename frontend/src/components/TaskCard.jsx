import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

const PRIORITY_STYLES = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function TaskCard({ task, index, onClick }) {
  const priority = task.priority || 'medium';
  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <Draggable draggableId={task._id || task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-white rounded-lg border border-gray-200 p-3 cursor-pointer select-none transition-shadow duration-150 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-300' : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-900 leading-snug flex-1">
              {task.title}
            </p>
            <span
              className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[priority]}`}
            >
              {priority}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-1">
            {dueDate ? (
              <span
                className={`text-xs flex items-center gap-1 ${
                  isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'
                }`}
              >
                📅 {dueDate}
              </span>
            ) : (
              <span />
            )}

            {task.assignee?.name || task.assigneeName ? (
              <div
                className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                title={task.assignee?.name || task.assigneeName}
              >
                {getInitials(task.assignee?.name || task.assigneeName)}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Draggable>
  );
}
