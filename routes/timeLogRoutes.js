const express = require("express");
const { getTimeLogs, addTimeLog } = require("../controllers/timeLogController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getTimeLogs);
router.post("/add", authMiddleware, addTimeLog);

module.exports = router;
