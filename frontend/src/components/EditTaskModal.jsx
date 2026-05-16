// components/EditTaskModal.jsx
// A modal dialog for editing an existing task.
// Receives the task to edit and calls onSave with updated fields.
import { useState, useEffect } from "react";

export default function EditTaskModal({ task, onSave, onClose, isLoading }) {
  const [form, setForm] = useState({
    title:       task.title,
    description: task.description || "",
    priority:    task.priority,
    status:      task.status,
  });
  const [error, setError] = useState("");

  // If the parent passes a different task, reset the form
  useEffect(() => {
    setForm({
      title:       task.title,
      description: task.description || "",
      priority:    task.priority,
      status:      task.status,
    });
  }, [task]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    onSave(task.id, form);
  };

  // Close modal on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    // Full-screen backdrop
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm
                 flex items-center justify-center z-50 px-4"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-lg
                      w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-slate-700">
          <span className="font-mono text-amber-400 text-sm font-medium
                           tracking-widest uppercase">
            Edit Task
          </span>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center
                       text-slate-400 hover:text-white hover:bg-slate-600
                       transition-all duration-200 font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1
                              tracking-wider uppercase">
              Title <span className="text-amber-400">*</span>
            </label>
            <input type="text" name="title" value={form.title}
              onChange={handleChange} autoFocus
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2
                         text-slate-100 font-sans text-sm
                         focus:outline-none focus:border-amber-400 transition-colors"/>
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1
                              tracking-wider uppercase">Description</label>
            <textarea name="description" value={form.description}
              onChange={handleChange} rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2
                         text-slate-100 font-sans text-sm resize-none
                         focus:outline-none focus:border-amber-400 transition-colors"/>
          </div>

          {/* Priority — pill buttons */}
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1
                              tracking-wider uppercase">Priority</label>
            <div className="flex gap-2">
              {["Low", "Medium", "High"].map((level) => (
                <button key={level} type="button"
                  onClick={() => setForm((p) => ({ ...p, priority: level }))}
                  className={`flex-1 py-1.5 rounded font-mono text-xs font-medium
                              border transition-all duration-200
                              ${form.priority === level
                                ? level === "High"
                                  ? "bg-red-900 border-red-600 text-red-300"
                                  : level === "Medium"
                                  ? "bg-amber-900 border-amber-600 text-amber-300"
                                  : "bg-slate-600 border-slate-500 text-slate-200"
                                : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500"
                              }`}>
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1
                              tracking-wider uppercase">Status</label>
            <div className="flex gap-2">
              {["pending", "completed"].map((s) => (
                <button key={s} type="button"
                  onClick={() => setForm((p) => ({ ...p, status: s }))}
                  className={`flex-1 py-1.5 rounded font-mono text-xs font-medium
                              border transition-all duration-200 capitalize
                              ${form.status === s
                                ? "bg-amber-900 border-amber-600 text-amber-300"
                                : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500"
                              }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400">⚠ {error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300
                         font-mono text-sm py-2 rounded transition-colors duration-200">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-900
                         font-mono font-medium text-sm py-2 rounded
                         transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}