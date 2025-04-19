const express = require("express");
const { getTimeLogs, addTimeLog } = require("../controllers/timeLogController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/time-logs:
 *   get:
 *     summary: Get all time logs for the current user
 *     tags: [Time Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: integer
 *         description: Filter logs by task ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering logs
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering logs
 *     responses:
 *       200:
 *         description: List of time logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   taskId:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                   duration:
 *                     type: integer
 *                     description: Duration in minutes
 *                   notes:
 *                     type: string
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getTimeLogs);

/**
 * @swagger
 * /api/time-logs/add:
 *   post:
 *     summary: Log time for a task
 *     tags: [Time Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - startTime
 *               - endTime
 *             properties:
 *               taskId:
 *                 type: integer
 *                 description: ID of the associated task
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start time of the work session
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the work session
 *               notes:
 *                 type: string
 *                 description: Optional notes about the work session
 *     responses:
 *       201:
 *         description: Time log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 timeLog:
 *                   type: object
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.post("/add", authMiddleware, addTimeLog);

module.exports = router;
