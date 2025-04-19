const { Task, Notification, User } = require("../models");
const { Op } = require("sequelize");
const schedule = require("node-schedule");
const { getTranslation } = require("./translations");

/**
 * Check for tasks due in the next 30 minutes and send notifications
 */
const checkUpcomingTasks = async () => {
  try {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    // Find tasks that are due in the next 30 minutes and haven't been notified yet
    // We're looking for tasks where:
    // 1. The deadline is between now and 30 minutes from now
    // 2. The status is not 'completed'
    const upcomingTasks = await Task.findAll({
      where: {
        deadline: {
          [Op.between]: [now, thirtyMinutesFromNow],
        },
        status: {
          [Op.ne]: "completed",
        },
      },
      include: [
        {
          model: User,
          attributes: ["id", "preferences"],
        },
      ],
    });

    console.log(
      `Found ${upcomingTasks.length} upcoming tasks due in the next 30 minutes`
    );

    // Send notification for each upcoming task
    for (const task of upcomingTasks) {
      // Skip if user has notifications disabled
      if (
        task.User &&
        task.User.preferences &&
        !task.User.preferences.notifications
      ) {
        console.log(
          `Skipping notification for user ${task.userId} - notifications disabled`
        );
        continue;
      }

      // Get user's preferred language
      const userLanguage =
        task.User && task.User.preferences?.language
          ? task.User.preferences.language
          : "kk";

      // Create notification message
      const message = getTranslation(
        "notifications.taskReminder",
        userLanguage,
        {
          taskTitle: task.title,
          minutesLeft: 30,
        }
      );

      // Check if a notification already exists for this task
      const existingNotification = await Notification.findOne({
        where: {
          userId: task.userId,
          message: {
            [Op.like]: `%${task.title}%`, // Basic check to avoid duplicate notifications
          },
          createdAt: {
            [Op.gt]: new Date(now.getTime() - 60 * 60 * 1000), // Created in the last hour
          },
        },
      });

      if (existingNotification) {
        console.log(`Notification already exists for task ${task.id}`);
        continue;
      }

      // Create the notification
      await Notification.create({
        userId: task.userId,
        message: message,
        type: "REMINDER",
        scheduledFor: now, // It's for now, not scheduled for future
      });

      console.log(
        `Created notification for task ${task.id} (${task.title}) for user ${task.userId}`
      );
    }
  } catch (error) {
    console.error("Error checking upcoming tasks:", error);
  }
};

/**
 * Schedule the task notification job to run every minute
 */
const scheduleTaskNotifications = () => {
  // Run every minute to check for tasks due in the next 30 minutes
  const job = schedule.scheduleJob("* * * * *", checkUpcomingTasks);

  console.log(
    "Task notification scheduler started - checking for upcoming tasks every minute"
  );

  return job;
};

module.exports = {
  scheduleTaskNotifications,
  checkUpcomingTasks,
};
