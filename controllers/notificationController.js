const { User, Notification, Task } = require("../models");
const { Op } = require("sequelize");
const schedule = require("node-schedule");
const { getTranslation } = require("../utils/translations");

// Get all notifications for the user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ notifications });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: error.message });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: { id: notificationId, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating notification", error: error.message });
  }
};

// Create a new notification for a user
const createNotification = async (req, res) => {
  try {
    const { userId, message, type, scheduledFor } = req.body;

    // Only admins or the user themselves should be able to create notifications
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        message: "Unauthorized to create notifications for other users",
      });
    }

    const notification = await Notification.create({
      userId,
      message,
      type: type || "INFO",
      scheduledFor,
    });

    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating notification", error: error.message });
  }
};

// Schedule daily reminders for all users at 21:00
const scheduleDailyReminders = () => {
  // Schedule a job that runs daily at 21:00
  const rule = new schedule.RecurrenceRule();
  rule.hour = 21;
  rule.minute = 0;

  schedule.scheduleJob(rule, async () => {
    try {
      // Get all users with notifications enabled
      const users = await User.findAll({
        where: {
          preferences: {
            notifications: true,
          },
        },
      });

      // Create a reminder notification for each user in their preferred language
      for (const user of users) {
        const userLanguage = user.preferences?.language || "kk";
        const message = getTranslation(
          "notifications.dailyFinanceReminder",
          userLanguage
        );

        await Notification.create({
          userId: user.id,
          message: message,
          type: "REMINDER",
        });
      }

      console.log(
        `Created daily finance reminders for ${
          users.length
        } users at ${new Date()}`
      );
    } catch (error) {
      console.error("Error scheduling daily reminders:", error);
    }
  });

  console.log("Daily finance reminders scheduled to run at 21:00");
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: { id: notificationId, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.destroy();

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting notification", error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification,
  scheduleDailyReminders,
  deleteNotification,
};
