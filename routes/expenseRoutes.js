const express = require("express");
const {
  getExpenses,
  addExpense,
  editExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses for the current user
 *     tags: [Expenses]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by expense category
 *     responses:
 *       200:
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   amount:
 *                     type: number
 *                   category:
 *                     type: string
 *                   description:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   userId:
 *                     type: integer
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getExpenses);

/**
 * @swagger
 * /api/expenses/add:
 *   post:
 *     summary: Add a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - category
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Expense amount
 *               category:
 *                 type: string
 *                 description: Expense category
 *               description:
 *                 type: string
 *                 description: Expense description
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Expense date
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 expense:
 *                   type: object
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post("/add", authMiddleware, addExpense);

/**
 * @swagger
 * /api/expenses/edit/{id}:
 *   put:
 *     summary: Update an existing expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Expense amount
 *               category:
 *                 type: string
 *                 description: Expense category
 *               description:
 *                 type: string
 *                 description: Expense description
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Expense date
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 expense:
 *                   type: object
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Server error
 */
router.put("/edit/:id", authMiddleware, editExpense);

/**
 * @swagger
 * /api/expenses/delete/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
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
 *         description: Expense not found
 *       500:
 *         description: Server error
 */
router.delete("/delete/:id", authMiddleware, deleteExpense);

module.exports = router;
