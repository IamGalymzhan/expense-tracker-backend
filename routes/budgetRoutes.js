const express = require("express");
const {
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get all budgets for the current user
 *     tags: [Budgets]
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
 *         description: List of budgets
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
 *                   amount:
 *                     type: number
 *                   spent:
 *                     type: number
 *                   month:
 *                     type: integer
 *                   year:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getBudgets);

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create a new budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - amount
 *               - month
 *               - year
 *             properties:
 *               category:
 *                 type: string
 *                 description: Budget category
 *               amount:
 *                 type: number
 *                 description: Budget amount
 *               month:
 *                 type: integer
 *                 description: Month (1-12)
 *               year:
 *                 type: integer
 *                 description: Year
 *     responses:
 *       201:
 *         description: Budget created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 budget:
 *                   type: object
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, addBudget);

/**
 * @swagger
 * /api/budgets/{id}:
 *   put:
 *     summary: Update an existing budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: Budget category
 *               amount:
 *                 type: number
 *                 description: Budget amount
 *               month:
 *                 type: integer
 *                 description: Month (1-12)
 *               year:
 *                 type: integer
 *                 description: Year
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 budget:
 *                   type: object
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: Budget not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updateBudget);

/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget deleted successfully
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
 *         description: Budget not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteBudget);

module.exports = router;
