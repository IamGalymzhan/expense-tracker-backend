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

router.get("/", authMiddleware, getIncomes);
router.post("/", authMiddleware, addIncome);
router.get("/:id", authMiddleware, getIncomeById);
router.put("/:id", authMiddleware, updateIncome);
router.delete("/:id", authMiddleware, deleteIncome);
router.get("/categories", authMiddleware, getIncomeCategories);

module.exports = router;
