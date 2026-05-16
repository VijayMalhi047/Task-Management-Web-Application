// components/FilterBar.jsx
export default function FilterBar({ filters, onFilterChange, onClearFilters }) {
  // Determine if any filter is active so we know whether to show Clear
  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all";

  return (
    <div className="space-y-2 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2
                     text-slate-100 font-sans text-sm placeholder-slate-500
                     focus:outline-none focus:border-amber-400 transition-colors"
        />
        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2
                     text-slate-100 font-sans text-sm
                     focus:outline-none focus:border-amber-400 transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange("priority", e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2
                     text-slate-100 font-sans text-sm
                     focus:outline-none focus:border-amber-400 transition-colors"
        >
          <option value="all">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Clear filters button — only visible when filters are active */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="font-mono text-xs text-slate-500 hover:text-amber-400
                       flex items-center gap-1.5 transition-colors duration-200
                       border border-slate-700 hover:border-amber-400/50
                       px-3 py-1 rounded"
          >
            <span>✕</span>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}