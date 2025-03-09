const express = require("express");
const {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  getTaskTimeStats,
} = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, addTask);
router.post("/add", authMiddleware, addTask);
router.put("/update/:id", authMiddleware, updateTask);
router.delete("/delete/:id", authMiddleware, deleteTask);
router.get("/time-stats", authMiddleware, getTaskTimeStats);

module.exports = router;
