import React, { useEffect, useRef } from 'react';

const ACTION_ICONS = {
  created: '✅',
  updated: '✏️',
  moved: '🔀',
  deleted: '🗑️',
  commented: '💬',
  default: '📌',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function ActivityTimeline({ activities = [], loading = false }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (activities.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activities]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-gray-700 px-4 pt-4 pb-2 border-b border-gray-200">
        Activity
      </h3>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading && (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && activities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">🕑</p>
            <p className="text-sm text-gray-400">No activity yet</p>
          </div>
        )}

        {!loading && activities.length > 0 && (
          <ol className="relative border-l border-gray-200 ml-2 space-y-4">
            {activities.map((activity, idx) => {
              const actionKey = activity.action?.toLowerCase() || 'default';
              const icon = ACTION_ICONS[actionKey] || ACTION_ICONS.default;
              const userName =
                activity.user?.name || activity.userName || 'Someone';

              return (
                <li key={activity._id || idx} className="ml-4">
                  <span className="absolute -left-2 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 ring-4 ring-white text-xs">
                    {icon}
                  </span>
                  <div>
                    <p className="text-xs text-gray-700 leading-snug">
                      <span className="font-medium">{userName}</span>{' '}
                      {activity.description || `${activity.action} a task`}
                    </p>
                    {activity.createdAt && (
                      <time className="text-xs text-gray-400">
                        {timeAgo(activity.createdAt)}
                      </time>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
