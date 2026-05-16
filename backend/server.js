// server.js
require("dotenv").config();

const express  = require("express");
const cors     = require("cors");
const { initializeStore } = require("./config/database");
const { validateEmailSetup } = require("./controllers/authController");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}]  ${req.method}  ${req.url}`);
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes (registered after DB is ready) ─────────────────────
const startServer = async () => {
  try {
    // Wait for sql.js WASM to load and schema to initialize
    // before accepting any requests
    await initializeStore();
    await validateEmailSetup();

    const taskRoutes = require("./routes/taskRoutes");
    const authRoutes = require("./routes/authRoutes");    // new

    app.use("/api/tasks", taskRoutes);
    app.use("/api/auth",  authRoutes);                    // new

    app.use((_req, res) => {
      res.status(404).json({ error: "Route not found." });
    });

    const errorHandler = require("./middleware/errorHandler");
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("[Server] Failed to start:", err);
    process.exit(1);
  }
};

startServer();
module.exports = app;