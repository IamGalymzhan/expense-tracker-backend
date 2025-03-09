const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  createNotification,
  deleteNotification,
} = require("../controllers/notificationController");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all notifications for the current user
router.get("/", getNotifications);

// Mark a notification as read
router.put("/:notificationId/read", markAsRead);

// Create a new notification (admin or self only)
router.post("/", createNotification);

// Delete a notification
router.delete("/:notificationId", deleteNotification);

module.exports = router;
