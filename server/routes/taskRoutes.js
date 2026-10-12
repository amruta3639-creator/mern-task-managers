const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const router = express.Router();

function validId(id) {
  return mongoose.isValidObjectId(id);
}

// GET: Fetch all tasks
router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// POST: Create a task
router.post("/", async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// PUT: Update a task
router.put("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const updates = {};
    const { title, description, completed } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty",
        });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be text",
        });
      }
      updates.description = description.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({
          message: "Completed must be true or false",
        });
      }
      updates.completed = completed;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update",
      });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// DELETE: Remove a task
router.delete("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
