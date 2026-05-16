// components/TaskForm.jsx
import { useState } from "react";

const EMPTY_FORM = { title: "", description: "", priority: "Medium" };

export default function TaskForm({ onSubmit, isLoading }) {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }
    await onSubmit(form);
    setForm(EMPTY_FORM);
    setExpanded(false);
  };

  const handleClose = () => {
    setExpanded(false);
    setForm(EMPTY_FORM);
    setError("");
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden mb-6">

      {/* ── Toggle Button — only shown when form is CLOSED ── */}
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-center gap-2 px-5 py-4
                     text-left hover:bg-slate-700 transition-colors duration-200
                     group"
        >
          {/* Plus icon */}
          <span className="w-5 h-5 rounded-full border-2 border-amber-400
                           flex items-center justify-center text-amber-400
                           text-base leading-none group-hover:bg-amber-400
                           group-hover:text-slate-900 transition-all duration-200">
            +
          </span>
          <span className="font-mono text-amber-400 text-sm font-medium tracking-widest uppercase">
            Add New Task
          </span>
        </button>
      )}

      {/* ── Expanded Form ────────────────────────────────────── */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden
                    ${expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        {/* Form header with explicit close button */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2
                        border-b border-slate-700">
          <span className="font-mono text-amber-400 text-sm font-medium
                           tracking-widest uppercase">
            New Task
          </span>

          {/* ── Close Button — clearly visible X ────────────── */}
          <button
            type="button"
            onClick={handleClose}
            title="Close form"
            className="w-7 h-7 rounded-full flex items-center justify-center
                       text-slate-400 hover:text-white hover:bg-slate-600
                       transition-all duration-200 text-base font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-4 space-y-4">

          {/* Title */}
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1
                              tracking-wider uppercase">
              Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              autoFocus
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2
                         text-slate-100 font-sans text-sm placeholder-slate-600
                         focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1
                              tracking-wider uppercase">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional details..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2
                         text-slate-100 font-sans text-sm placeholder-slate-600
                         focus:outline-none focus:border-amber-400 transition-colors resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1
                              tracking-wider uppercase">
              Priority
            </label>
            <div className="flex gap-2">
              {["Low", "Medium", "High"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, priority: level }))}
                  className={`flex-1 py-1.5 rounded font-mono text-xs font-medium
                              border transition-all duration-200
                              ${form.priority === level
                                ? level === "High"
                                  ? "bg-red-900 border-red-600 text-red-300"
                                  : level === "Medium"
                                  ? "bg-amber-900 border-amber-600 text-amber-300"
                                  : "bg-slate-600 border-slate-500 text-slate-200"
                                : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500"
                              }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Error */}
          {error && (
            <p className="text-red-400 font-mono text-xs flex items-center gap-1">
              <span>⚠</span> {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300
                         font-mono text-sm py-2 rounded transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-900
                         font-mono font-medium text-sm py-2 rounded
                         transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding..." : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}