const express = require("express");
const {
  getIncomes,
  addIncome,
  getIncomeById,
  updateIncome,
  deleteIncome,
  getIncomeCategories,
} = require("../controllers/incomeController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/incomes:
 *   get:
 *     summary: Get all incomes for the current user
 *     tags: [Incomes]
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
 *         description: Filter by income category
 *     responses:
 *       200:
 *         description: List of incomes
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
router.get("/", authMiddleware, getIncomes);

/**
 * @swagger
 * /api/incomes/categories:
 *   get:
 *     summary: Get all income categories
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of income categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/categories", authMiddleware, getIncomeCategories);

/**
 * @swagger
 * /api/incomes:
 *   post:
 *     summary: Add a new income
 *     tags: [Incomes]
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
 *                 description: Income amount
 *               category:
 *                 type: string
 *                 description: Income category
 *               description:
 *                 type: string
 *                 description: Income description
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Income date
 *     responses:
 *       201:
 *         description: Income created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 income:
 *                   type: object
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, addIncome);

/**
 * @swagger
 * /api/incomes/{id}:
 *   get:
 *     summary: Get income by ID
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Income ID
 *     responses:
 *       200:
 *         description: Income details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 amount:
 *                   type: number
 *                 category:
 *                   type: string
 *                 description:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 userId:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: Income not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getIncomeById);

/**
 * @swagger
 * /api/incomes/{id}:
 *   put:
 *     summary: Update an existing income
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Income ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Income amount
 *               category:
 *                 type: string
 *                 description: Income category
 *               description:
 *                 type: string
 *                 description: Income description
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Income date
 *     responses:
 *       200:
 *         description: Income updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 income:
 *                   type: object
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: Income not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updateIncome);

/**
 * @swagger
 * /api/incomes/{id}:
 *   delete:
 *     summary: Delete an income
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Income ID
 *     responses:
 *       200:
 *         description: Income deleted successfully
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
 *         description: Income not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteIncome);

module.exports = router;
