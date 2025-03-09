const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  updateLanguage,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/password", updatePassword);
router.put("/language", updateLanguage);

module.exports = router;
