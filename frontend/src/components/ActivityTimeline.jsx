import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatRelativeTime = (date) => {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getActionColor = (action) => {
  if (action.includes('Created') || action.includes('created')) return 'bg-green-500'
  if (action.includes('Deleted') || action.includes('deleted')) return 'bg-red-500'
  if (action.includes('Moved') || action.includes('moved')) return 'bg-blue-500'
  return 'bg-indigo-500'
}

const ActivityTimeline = ({ projectId, newActivity }) => {
  const [activities, setActivities] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const fetchActivities = useCallback(async (pageNum = 1, reset = false) => {
    setLoading(true)
    try {
      const res = await api.get(`/api/activities/project/${projectId}?page=${pageNum}&limit=10`)
      const { items, pagination } = res.data.data
      setActivities((prev) => reset ? items : [...prev, ...items])
      setHasMore(pageNum < pagination.totalPages)
      setPage(pageNum)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) fetchActivities(1, true)
  }, [projectId, fetchActivities])

  // Add new activity from socket
  useEffect(() => {
    if (newActivity) {
      setActivities((prev) => [newActivity, ...prev])
    }
  }, [newActivity])

  const loadMore = () => fetchActivities(page + 1)

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 px-1">Activity</h3>

      {activities.length === 0 && !loading ? (
        <p className="text-sm text-gray-400 text-center py-8">No activity yet</p>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

            {activities.map((activity, idx) => (
              <div key={activity.id} className="relative flex gap-3 pb-4">
                {/* Dot */}
                <div className={`relative z-10 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5
                  ${getActionColor(activity.action)}`}
                >
                  {activity.user ? getInitials(activity.user.name) : '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-snug">{activity.action}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-gray-400">{activity.user?.name}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{formatRelativeTime(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full text-xs text-indigo-600 hover:text-indigo-800 py-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ActivityTimeline
