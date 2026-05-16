// App.jsx
import { useState, useEffect, useCallback } from "react";
import * as api          from "./api/tasks";
import TaskForm          from "./components/TaskForm";
import TaskList          from "./components/TaskList";
import FilterBar         from "./components/FilterBar";
import EditTaskModal     from "./components/EditTaskModal";
import AuthPage          from "./pages/AuthPage";

const INITIAL_FILTERS = { status: "all", priority: "all", search: "" };

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("taskflow_session");
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks,        setTasks]        = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState(null);
  const [filters,      setFilters]      = useState(INITIAL_FILTERS);
  const [isAdding,     setIsAdding]     = useState(false);
  const [editingTask,  setEditingTask]  = useState(null);  // task object or null
  const [isSaving,     setIsSaving]     = useState(false);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.fetchTasks(filters);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (currentUser) loadTasks();
  }, [loadTasks, currentUser]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset all filters to their default "show everything" state
  const handleClearFilters = () => setFilters(INITIAL_FILTERS);

  const handleCreate = async (formData) => {
    setIsAdding(true);
    setError(null);
    try {
      await api.createTask(formData);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleComplete = async (id, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    setError(null);
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      await api.updateTask(id, { status: newStatus });
    } catch (err) {
      setError(err.message);
      loadTasks();
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await api.deleteTask(id);
    } catch (err) {
      setError(err.message);
      loadTasks();
    }
  };

  // Open the edit modal with the selected task
  const handleEditOpen  = (task) => setEditingTask(task);
  const handleEditClose = ()     => setEditingTask(null);

  const handleEditSave = async (id, updates) => {
    setIsSaving(true);
    setError(null);
    try {
      await api.updateTask(id, updates);
      await loadTasks();
      setEditingTask(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("taskflow_session");
    localStorage.removeItem("taskflow_token");
    setCurrentUser(null);
    setTasks([]);
    setFilters(INITIAL_FILTERS);
  };

  if (!currentUser) {
    return <AuthPage onAuthSuccess={(user) => {
      localStorage.setItem("taskflow_session", JSON.stringify(user));
      setCurrentUser(user);
    }} />;
  }

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-2xl font-medium text-amber-400 tracking-tight">
                TaskFlow
              </h1>
              <p className="font-sans text-sm text-slate-500 mt-0.5">
                Effective-RM Task Management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-mono text-xs text-slate-300">
                  {currentUser.username || currentUser.email?.split("@")[0]}
                </p>
                {!isLoading && (
                  <p className="font-mono text-xs text-slate-600">
                    {completedCount}/{tasks.length} completed
                  </p>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center
                              justify-center font-mono text-sm font-medium text-slate-900">
                {(currentUser.username || currentUser.email || "U")[0].toUpperCase()}
              </div>
              <button onClick={handleLogout}
                className="font-mono text-xs text-slate-500 hover:text-red-400
                           border border-slate-700 hover:border-red-400/50
                           px-2.5 py-1 rounded transition-all duration-200">
                Sign Out
              </button>
            </div>
          </div>
          <div className="mt-4 h-px bg-slate-800 relative">
            <div className="absolute left-0 top-0 h-px w-16 bg-amber-400" />
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="mb-4 bg-red-950 border border-red-800 rounded px-4 py-3
                          flex items-center justify-between">
            <span className="font-mono text-xs text-red-400">{error}</span>
            <button onClick={() => setError(null)}
              className="text-red-600 hover:text-red-400 font-mono text-sm ml-4">
              ×
            </button>
          </div>
        )}

        <TaskForm onSubmit={handleCreate} isLoading={isAdding} />

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onEdit={handleEditOpen}
        />

        {/* Edit modal — rendered at root level so it overlays everything */}
        {editingTask && (
          <EditTaskModal
            task={editingTask}
            onSave={handleEditSave}
            onClose={handleEditClose}
            isLoading={isSaving}
          />
        )}

      </div>
    </div>
  );
}