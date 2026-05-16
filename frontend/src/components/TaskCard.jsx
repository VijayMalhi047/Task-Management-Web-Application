// components/TaskCard.jsx
const PRIORITY_STYLES = {
  High:   "bg-red-900 text-red-300 border-red-700",
  Medium: "bg-amber-900 text-amber-300 border-amber-700",
  Low:    "bg-slate-700 text-slate-300 border-slate-600",
};

export default function TaskCard({ task, onComplete, onDelete, onEdit, style }) {
  const isCompleted = task.status === "completed";

  const formattedDate = new Date(task.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div
      style={style}
      className={`animate-fade-in border rounded-lg px-5 py-4
                  transition-all duration-300
                  ${isCompleted
                    ? "bg-slate-800/50 border-slate-700/50 opacity-70"
                    : "bg-slate-800 border-slate-700 hover:border-amber-400/50"
                  }`}
    >
      <div className="flex items-start gap-4">

        {/* Complete toggle */}
        <button
          onClick={() => onComplete(task.id, task.status)}
          title={isCompleted ? "Mark as pending" : "Mark as completed"}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2
                      flex items-center justify-center transition-all duration-200
                      ${isCompleted
                        ? "bg-amber-400 border-amber-400 text-slate-900"
                        : "border-slate-500 hover:border-amber-400 hover:bg-amber-400/10"
                      }`}
        >
          {isCompleted && (
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className={`font-mono text-sm font-medium truncate
                            ${isCompleted ? "line-through text-slate-500" : "text-slate-100"}`}>
              {task.title}
            </h3>
            <span className={`flex-shrink-0 font-mono text-xs px-2 py-0.5
                              rounded border
                              ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium}`}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="font-sans text-sm text-slate-400 mb-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-600">#{task.id}</span>
            <span className="font-mono text-xs text-slate-600">{formattedDate}</span>
            <span className={`font-mono text-xs px-1.5 py-0.5 rounded
                              ${isCompleted
                                ? "bg-slate-700 text-slate-500"
                                : "bg-slate-900 text-amber-400/80"}`}>
              {task.status}
            </span>
          </div>
        </div>

        {/* ── Action buttons — always visible ──────────────── */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Edit button */}
          <button
            onClick={() => onEdit(task)}
            title="Edit task"
            className="w-7 h-7 rounded flex items-center justify-center
                       text-slate-500 hover:text-amber-400 hover:bg-amber-400/10
                       border border-transparent hover:border-amber-400/30
                       transition-all duration-200 text-sm"
          >
            ✎
          </button>

          {/* Delete button — always visible at reduced opacity */}
          <button
            onClick={() => onDelete(task.id)}
            title="Delete task"
            className="w-7 h-7 rounded flex items-center justify-center
                       text-slate-500 hover:text-red-400 hover:bg-red-400/10
                       border border-transparent hover:border-red-400/30
                       transition-all duration-200 text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}