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

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the current user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, all]
 *         description: Filter tasks by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *         description: Filter tasks by priority
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   priority:
 *                     type: string
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                   userId:
 *                     type: integer
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getTasks);

/**
 * @swagger
 * /api/tasks/time-stats:
 *   get:
 *     summary: Get time statistics for tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Task time statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTime:
 *                   type: number
 *                 taskBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       taskId:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       timeSpent:
 *                         type: number
 *                       percentage:
 *                         type: number
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/time-stats", authMiddleware, getTaskTimeStats);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               status:
 *                 type: string
 *                 enum: [pending, completed]
 *                 default: pending
 *                 description: Task status
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 default: medium
 *                 description: Task priority
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: Task due date
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   type: object
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, addTask);

/**
 * @swagger
 * /api/tasks/add:
 *   post:
 *     summary: Alternative endpoint to create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               status:
 *                 type: string
 *                 enum: [pending, completed]
 *                 default: pending
 *                 description: Task status
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 default: medium
 *                 description: Task priority
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: Task due date
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   type: object
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post("/add", authMiddleware, addTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               status:
 *                 type: string
 *                 enum: [pending, completed]
 *                 description: Task status
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 description: Task priority
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: Task due date
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
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
router.put("/:id", authMiddleware, updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;
