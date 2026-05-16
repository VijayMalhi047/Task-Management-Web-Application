// components/TaskList.jsx
import TaskCard from "./TaskCard";

const SkeletonCard = () => (
  <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4">
    <div className="flex items-start gap-4">
      <div className="w-5 h-5 rounded border-2 border-slate-700 flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-700 rounded animate-subtle-pulse w-2/3" />
        <div className="h-3 bg-slate-700 rounded animate-subtle-pulse w-1/3" />
      </div>
    </div>
  </div>
);

export default function TaskList({ tasks, isLoading, onComplete, onDelete, onEdit }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-mono text-slate-600 text-sm">No tasks found.</p>
        <p className="font-mono text-slate-700 text-xs mt-1">
          Add one above or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          style={{ animationDelay: `${index * 60}ms` }}
        />
      ))}
    </div>
  );
}