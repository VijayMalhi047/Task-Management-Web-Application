// routes/taskRoutes.js
// ─────────────────────────────────────────────────────────────
// RESPONSIBILITY: URL-to-controller mapping. Nothing else.
// Routes are intentionally thin — no logic lives here.
//
// WHY KEEP ROUTES SEPARATE FROM CONTROLLERS?
// A route answers "which URL triggers what?".
// A controller answers "what actually happens?".
// Keeping them separate means you can reorganize your URL structure
// without touching any business logic, and vice versa.
//
// This router is mounted at '/api/tasks' in server.js, so:
//   router path '/'    → full path '/api/tasks'
//   router path '/:id' → full path '/api/tasks/:id'
// ─────────────────────────────────────────────────────────────

const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");

const {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

// GET    /api/tasks       → fetch all tasks (with optional filters)
// All task routes require an authenticated user
router.use(auth);
router.get("/",     getAllTasks);

// POST   /api/tasks       → create a new task
router.post("/",    createTask);

// PUT    /api/tasks/:id   → update a task by ID
router.put("/:id",  updateTask);

// DELETE /api/tasks/:id   → delete a task by ID
router.delete("/:id", deleteTask);

module.exports = router;