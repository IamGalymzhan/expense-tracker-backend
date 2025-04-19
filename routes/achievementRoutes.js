const express = require("express");
const {
  getAchievements,
  getAchievementById,
  getAchievementProgress,
  getAchievementsByCategory,
  initializeAchievements,
  debugAchievements,
} = require("../controllers/achievementController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/achievements:
 *   get:
 *     summary: Get all achievements for the current user
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of achievements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   category:
 *                     type: string
 *                   requiredAmount:
 *                     type: integer
 *                   currentAmount:
 *                     type: integer
 *                   completed:
 *                     type: boolean
 *                   completedAt:
 *                     type: string
 *                     format: date-time
 *                   icon:
 *                     type: string
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getAchievements);

/**
 * @swagger
 * /api/achievements/progress:
 *   get:
 *     summary: Get achievement progress for the current user
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievement progress data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAchievements:
 *                   type: integer
 *                 completed:
 *                   type: integer
 *                 percentComplete:
 *                   type: number
 *                 recentlyCompleted:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/progress", authMiddleware, getAchievementProgress);

/**
 * @swagger
 * /api/achievements/category/{category}:
 *   get:
 *     summary: Get achievements by category
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [financial, time]
 *         description: Achievement category
 *     responses:
 *       200:
 *         description: List of achievements in the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   category:
 *                     type: string
 *                   requiredAmount:
 *                     type: integer
 *                   currentAmount:
 *                     type: integer
 *                   completed:
 *                     type: boolean
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       400:
 *         description: Invalid category
 *       500:
 *         description: Server error
 */
router.get("/category/:category", authMiddleware, getAchievementsByCategory);

/**
 * @swagger
 * /api/achievements/initialize:
 *   post:
 *     summary: Initialize achievements for a user
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievements initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 achievements:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post("/initialize", authMiddleware, initializeAchievements);

/**
 * @swagger
 * /api/achievements/debug:
 *   get:
 *     summary: Debug endpoint for achievements
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Debug information about achievements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/debug", authMiddleware, debugAchievements);

/**
 * @swagger
 * /api/achievements/{id}:
 *   get:
 *     summary: Get a specific achievement by ID
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Achievement ID
 *     responses:
 *       200:
 *         description: Achievement details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 category:
 *                   type: string
 *                 requiredAmount:
 *                   type: integer
 *                 currentAmount:
 *                   type: integer
 *                 completed:
 *                   type: boolean
 *                 completedAt:
 *                   type: string
 *                   format: date-time
 *                 icon:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: Achievement not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getAchievementById);

module.exports = router;
