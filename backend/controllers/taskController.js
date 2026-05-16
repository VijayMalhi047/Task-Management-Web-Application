// controllers/taskController.js
const { query, run } = require("../config/database");

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// GET /api/tasks
const getAllTasks = (req, res, next) => {
  try {
    const { status, priority, search } = req.query;

    let sql    = "SELECT * FROM tasks WHERE 1=1";
    const params = [];

    if (status && status !== "all") {
      sql += " AND status = ?";
      params.push(status);
    }
    if (priority && priority !== "all") {
      sql += " AND priority = ?";
      params.push(priority);
    }
    if (search) {
      sql += " AND title LIKE ?";
      params.push(`%${search}%`);
    }

    // Only return tasks belonging to the authenticated user
    sql += " AND user_id = ?";
    params.push(req.user.id);

    sql += " ORDER BY created_at DESC";

    const tasks = query(sql, params);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
const createTask = (req, res, next) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !title.trim()) {
      return next(createError("Title is required.", 400));
    }

    const validPriorities = ["Low", "Medium", "High"];
    if (priority && !validPriorities.includes(priority)) {
      return next(createError(`Priority must be one of: ${validPriorities.join(", ")}.`, 400));
    }

    const { lastInsertRowid } = run(
      `INSERT INTO tasks (title, description, priority, status, user_id)
       VALUES (?, ?, ?, 'pending', ?)`,
      [title.trim(), (description || "").trim(), priority || "Medium", req.user.id]
    );

    const [newTask] = query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [lastInsertRowid, req.user.id]);
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id — handles both status update AND full edit
const updateTask = (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) return next(createError("Invalid task ID.", 400));

    // Ensure the task belongs to the authenticated user
    const [existing] = query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [taskId, req.user.id]);
    if (!existing) return next(createError(`Task ${taskId} not found.`, 404));

    const validStatuses   = ["pending", "completed"];
    const validPriorities = ["Low", "Medium", "High"];

    const { title, description, status, priority } = req.body;

    if (status && !validStatuses.includes(status))
      return next(createError(`Status must be one of: ${validStatuses.join(", ")}.`, 400));
    if (priority && !validPriorities.includes(priority))
      return next(createError(`Priority must be one of: ${validPriorities.join(", ")}.`, 400));

    // Merge: use incoming value if provided, otherwise keep existing
    const updatedTitle       = title       ? title.trim()       : existing.title;
    const updatedDescription = description !== undefined ? description.trim() : existing.description;
    const updatedStatus      = status   || existing.status;
    const updatedPriority    = priority || existing.priority;

    run(
      `UPDATE tasks
       SET title = ?, description = ?, status = ?, priority = ?
       WHERE id = ? AND user_id = ?`,
      [updatedTitle, updatedDescription, updatedStatus, updatedPriority, taskId, req.user.id]
    );

    const [updatedTask] = query("SELECT * FROM tasks WHERE id = ?", [taskId]);
    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
const deleteTask = (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) return next(createError("Invalid task ID.", 400));

    // Ensure the task belongs to the authenticated user
    const [existing] = query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [taskId, req.user.id]);
    if (!existing) return next(createError(`Task ${taskId} not found.`, 404));

    run("DELETE FROM tasks WHERE id = ? AND user_id = ?", [taskId, req.user.id]);
    res.status(200).json({ message: `Task ${taskId} deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask };