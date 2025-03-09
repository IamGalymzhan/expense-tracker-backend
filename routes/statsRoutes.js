const express = require("express");
const {
  getOverviewStats,
  getMonthlyStats,
  getCategoryBreakdown,
  getDailyNetIncome,
} = require("../controllers/statsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/overview", authMiddleware, getOverviewStats);
router.get("/monthly", authMiddleware, getMonthlyStats);
router.get("/monthly/daily", authMiddleware, getDailyNetIncome);
router.get("/category-breakdown", authMiddleware, getCategoryBreakdown);
router.get("/daily-net-income", authMiddleware, getDailyNetIncome);

module.exports = router;
