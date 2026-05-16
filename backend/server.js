// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");

const { initializeStore } = require("./config/database");
const { validateEmailSetup } = require("./controllers/authController");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Enable wide cross-origin routing for serverless execution testing
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Dual-mounting handles both proxy path structures natively
app.use("/api/tasks", taskRoutes);
app.use("/tasks", taskRoutes);

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use(errorHandler);

const serverlessHandlerInstance = serverless(app);

module.exports.handler = async (event, context) => {
  // Prevent background loops from stalling the gateway execution response
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    await initializeStore();
    try {
      await validateEmailSetup();
    } catch (emailError) {
      console.warn("[SMTP WARNING] Verification bypassed on cloud execution nodes:", emailError.message);
    }
  } catch (bootError) {
    console.error("[FATAL CRASH] Core boot collapse:", bootError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal initialization error", details: bootError.message })
    };
  }

  return serverlessHandlerInstance(event, context);
};