const express = require("express");
const {
  getAchievements,
  getAchievementById,
  getAchievementProgress,
  getAchievementsByCategory,
  initializeAchievements,
} = require("../controllers/achievementController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all achievements for current user
router.get("/", authMiddleware, getAchievements);

// Get achievement progress
router.get("/progress", authMiddleware, getAchievementProgress);

// Get achievements by category (financial or time)
router.get("/category/:category", authMiddleware, getAchievementsByCategory);

// Initialize achievements for a new user (useful for existing users or testing)
router.post("/initialize", authMiddleware, initializeAchievements);

// Get specific achievement by ID
router.get("/:id", authMiddleware, getAchievementById);

module.exports = router;
