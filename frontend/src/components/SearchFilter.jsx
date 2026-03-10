import React from 'react';

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function SearchFilter({ onSearch, onFilter, filters = {} }) {
  const hasFilters = filters.search || filters.priority || filters.status;

  function handleSearch(e) {
    onSearch(e.target.value);
  }

  function handlePriority(e) {
    onFilter({ ...filters, priority: e.target.value });
  }

  function handleStatus(e) {
    onFilter({ ...filters, status: e.target.value });
  }

  function handleClear() {
    onSearch('');
    onFilter({ search: '', priority: '', status: '' });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search tasks…"
          value={filters.search || ''}
          onChange={handleSearch}
          className="input-field pl-9 py-1.5 text-sm"
        />
      </div>

      {/* Priority filter */}
      <select
        value={filters.priority || ''}
        onChange={handlePriority}
        className="input-field w-auto py-1.5 text-sm"
      >
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={filters.status || ''}
        onChange={handleStatus}
        className="input-field w-auto py-1.5 text-sm"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={handleClear}
          className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}
