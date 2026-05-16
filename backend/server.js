// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initializeStore } = require("./config/database");
const { validateEmailSetup } = require("./controllers/authController");
const errorHandler = require("./middleware/errorHandler"); // ✅ Fixed: Moved to global scope

const app = express();

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

// ── SERVERLESS NETLIFY DEPLOYMENT CONFIGURATION ─────────────────────
const serverless = require("serverless-http");
let serverlessHandler;

// Export the serverless function handler directly
// Inside backend/server.js

module.exports.handler = async (event, context) => {
  if (!serverlessHandler) {
    try {
      await initializeStore();

      try {
        await validateEmailSetup();
      } catch (emailError) {
        console.warn("[WARNING] Email SMTP setup bypassed on cloud environment:", emailError.message);
      }

      const taskRoutes = require("./routes/taskRoutes");
      const authRoutes = require("./routes/authRoutes");


      app.use("/api/tasks", taskRoutes);
      app.use("/tasks", taskRoutes);     // Fallback

      app.use("/api/auth", authRoutes);
      app.use("/auth", authRoutes);

      app.use((_req, res) => {
        res.status(404).json({ error: "Route not found." });
      });

      // Centralized error interceptor
      app.use(errorHandler);

      // Wrap Express app with serverless router layers
      serverlessHandler = serverless(app);
    } catch (error) {
      console.error("Fatal boot collapse:", error);
      throw error;
    }
  }

  // Process incoming request
  return serverlessHandler(event, context);
};