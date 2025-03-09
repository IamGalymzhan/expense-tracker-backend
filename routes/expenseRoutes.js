const express = require("express");
const {
  getExpenses,
  addExpense,
  editExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const {
  generatePDFReport,
  sendReportEmail,
} = require("../controllers/exportController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getExpenses);
router.post("/add", authMiddleware, addExpense);
router.put("/edit/:id", authMiddleware, editExpense);
router.delete("/delete/:id", authMiddleware, deleteExpense);

// Report routes
router.get("/report/pdf", authMiddleware, generatePDFReport);
router.post("/report/email", authMiddleware, sendReportEmail);

module.exports = router;
