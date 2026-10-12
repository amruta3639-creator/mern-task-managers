const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const taskRoutes = require("./routes/taskRoutes");
const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

let connectionPromise;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI)
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(503).json({
      message: "Unable to connect to the database",
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Task Manager API is running",
  });
});

app.use("/api/tasks", taskRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.message);

  if (res.headersSent) return next(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier" });
  }

  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
