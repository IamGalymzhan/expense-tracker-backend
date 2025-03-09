const express = require("express");
const { getTips } = require("../controllers/tipsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", authMiddleware, getTips);

module.exports = router;
