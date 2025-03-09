const express = require("express");
const { updateSettings, changePassword, getSettings } = require("../controllers/settingsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/update", authMiddleware, updateSettings);
router.put("/change-password", authMiddleware, changePassword);
router.get("/", authMiddleware, getSettings);

module.exports = router;
