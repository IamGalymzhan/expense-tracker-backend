const express = require("express");
const { getTips } = require("../controllers/tipsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/tips:
 *   get:
 *     summary: Get financial tips and advice
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [saving, budgeting, investing, general]
 *         description: Category of tips
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         default: 10
 *         description: Maximum number of tips to return
 *     responses:
 *       200:
 *         description: List of financial tips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   category:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   source:
 *                     type: string
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getTips);

module.exports = router;
