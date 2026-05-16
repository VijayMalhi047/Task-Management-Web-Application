// api/tasks.js
// ─────────────────────────────────────────────────────────────
// RESPONSIBILITY: All HTTP communication with the backend lives here.
// Components never call fetch() directly — they call these functions.
//
// WHY AN ISOLATED API LAYER?
// If the backend URL changes, or we switch from fetch to axios, or
// we add an auth token to every request — we change ONE file,
// not every component that needs data. Same separation-of-concerns
// principle we applied on the backend.
// ─────────────────────────────────────────────────────────────

// The base URL for all API calls.
// Vite exposes env variables via import.meta.env.
// Falls back to localhost:5000 for local development.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// ─── HELPER ──────────────────────────────────────────────────
// Wraps fetch with consistent error handling.
// If the server returns a non-2xx status, we parse the error body
// and throw a real Error object so React can catch it cleanly.
const request = async (endpoint, options = {}) => {
  // Attach JSON content-type and Authorization header when available
  const token = localStorage.getItem("taskflow_token");
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    // Use the server's error message if available, otherwise a generic fallback.
    throw new Error(data.error || "An unexpected error occurred.");
  }

  return data;
};

// ─── API FUNCTIONS ────────────────────────────────────────────

/**
 * Fetch all tasks. Accepts an optional filters object.
 * @param {{ status?: string, priority?: string, search?: string }} filters
 */
export const fetchTasks = (filters = {}) => {
  // Build a query string from the filters object, omitting empty values.
  // e.g. { status: 'pending', priority: 'High' } → '?status=pending&priority=High'
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v && v !== "all")
    )
  );
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/tasks${query}`);
};

/**
 * Create a new task.
 * @param {{ title: string, description?: string, priority?: string }} taskData
 */
export const createTask = (taskData) =>
  request("/tasks", {
    method:  "POST",
    body:    JSON.stringify(taskData),
  });

/**
 * Update an existing task by ID.
 * @param {number} id
 * @param {object} updates - Any subset of task fields to update
 */
export const updateTask = (id, updates) =>
  request(`/tasks/${id}`, {
    method: "PUT",
    body:   JSON.stringify(updates),
  });

/**
 * Delete a task by ID.
 * @param {number} id
 */
export const deleteTask = (id) =>
  request(`/tasks/${id}`, { method: "DELETE" });