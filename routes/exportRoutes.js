const express = require("express");
const { exportData } = require("../controllers/exportController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, exportData);

module.exports = router;
