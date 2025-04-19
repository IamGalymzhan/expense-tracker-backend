const express = require("express");
const {
  exportData,
  exportExpensesToExcel,
  exportIncomesToExcel,
} = require("../controllers/exportController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/export:
 *   get:
 *     summary: Export user data
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel, pdf]
 *         default: json
 *         description: Export format
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [expenses, incomes, all]
 *         default: all
 *         description: Type of data to export
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering data
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering data
 *     responses:
 *       200:
 *         description: Data export
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, exportData);

/**
 * @swagger
 * /api/export/expenses/excel:
 *   get:
 *     summary: Export expenses to Excel format
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, thisWeek, thisMonth, lastMonth, month]
 *         description: Predefined period for filtering data
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering data (alternative to period)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering data (alternative to period)
 *     responses:
 *       200:
 *         description: Excel file containing expense data
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/expenses/excel", authMiddleware, exportExpensesToExcel);

/**
 * @swagger
 * /api/export/incomes/excel:
 *   get:
 *     summary: Export incomes to Excel format
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, thisWeek, thisMonth, lastMonth, month]
 *         description: Predefined period for filtering data
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering data (alternative to period)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering data (alternative to period)
 *     responses:
 *       200:
 *         description: Excel file containing income data
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/incomes/excel", authMiddleware, exportIncomesToExcel);

module.exports = router;
