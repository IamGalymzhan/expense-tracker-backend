const express = require("express");
const {
  getOverviewStats,
  getMonthlyStats,
  getCategoryBreakdown,
  getDailyNetIncome,
} = require("../controllers/statsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     summary: Get overview statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Overview statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                 totalExpenses:
 *                   type: number
 *                 netIncome:
 *                   type: number
 *                 savingsRate:
 *                   type: number
 *                 expenseBreakdown:
 *                   type: object
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/overview", authMiddleware, getOverviewStats);

/**
 * @swagger
 * /api/stats/monthly:
 *   get:
 *     summary: Get monthly statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for statistics (defaults to current year)
 *     responses:
 *       200:
 *         description: Monthly statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 months:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: integer
 *                       income:
 *                         type: number
 *                       expenses:
 *                         type: number
 *                       savings:
 *                         type: number
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/monthly", authMiddleware, getMonthlyStats);

/**
 * @swagger
 * /api/stats/monthly/daily:
 *   get:
 *     summary: Get daily net income for a specific month
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Month number (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year (e.g., 2023)
 *     responses:
 *       200:
 *         description: Daily net income data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: integer
 *                   income:
 *                     type: number
 *                   expenses:
 *                     type: number
 *                   net:
 *                     type: number
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/monthly/daily", authMiddleware, getDailyNetIncome);

/**
 * @swagger
 * /api/stats/category-breakdown:
 *   get:
 *     summary: Get expense breakdown by category
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Month number (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year (e.g., 2023)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [expense, income]
 *         description: Type of transaction to break down
 *     responses:
 *       200:
 *         description: Category breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   percentage:
 *                     type: number
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/category-breakdown", authMiddleware, getCategoryBreakdown);

/**
 * @swagger
 * /api/stats/daily-net-income:
 *   get:
 *     summary: Get daily net income
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Month number (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year (e.g., 2023)
 *     responses:
 *       200:
 *         description: Daily net income data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: integer
 *                   income:
 *                     type: number
 *                   expenses:
 *                     type: number
 *                   net:
 *                     type: number
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/daily-net-income", authMiddleware, getDailyNetIncome);

module.exports = router;
