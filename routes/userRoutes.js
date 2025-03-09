const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  updatePassword,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.put("/password", authMiddleware, updatePassword);

module.exports = router;
