try {
  const { Task, User } = require("../models");
  const { sendEmail } = require("../utils/emailService");
  const { Op } = require("sequelize");
  const AchievementService = require("../utils/achievementService");

  const getTasks = async (req, res) => {
    // FIRST: Send back details about the request to diagnose issues
    console.log("REQUEST HEADERS:", JSON.stringify(req.headers, null, 2));

    // Check if Authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({
        message: "No Authorization header found in request",
        headers: req.headers,
      });
    }

    // Check if req.user exists AT ALL (before any other checks)
    if (!req.user) {
      return res.status(500).json({
        message:
          "req.user is undefined - authMiddleware may not be working correctly",
        authHeader: req.headers.authorization,
        // Be very careful with the next line in production - it exposes your JWT secret!
        jwtSecret:
          process.env.NODE_ENV === "development"
            ? process.env.JWT_SECRET
            : "[hidden]",
      });
    }

    // Continue with regular flow
    try {
      console.log(`getTasks: Attempting to fetch tasks`);

      // Log the entire req.user object to see what's available
      console.log("User data from token:", JSON.stringify(req.user));

      // Get user ID, with fallback options in case it's stored in different properties
      const userId =
        req.user && (req.user.id || req.user.userId || req.user._id);

      if (!userId) {
        console.error("Missing user ID in the decoded token");
        return res.status(401).json({
          message: "Invalid user identification in token",
          decodedToken: req.user,
        });
      }

      console.log(`getTasks: Fetching tasks for user ID: ${userId}`);

      // Test database connection first
      try {
        const tasks = await Task.findAll({
          where: { userId: userId },
          order: [["deadline", "ASC"]],
        });

        console.log(`getTasks: Successfully retrieved ${tasks.length} tasks`);
        return res.status(200).json(tasks);
      } catch (dbError) {
        console.error("Database error in getTasks:", dbError);
        return res.status(500).json({
          message: "Database error when fetching tasks",
          error: dbError.message,
          stack:
            process.env.NODE_ENV === "development" ? dbError.stack : undefined,
        });
      }
    } catch (error) {
      console.error("Unexpected error in getTasks:", error);
      return res.status(500).json({
        message: "Unexpected error when processing request",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  };

  const addTask = async (req, res) => {
    try {
      const { title, duration, deadline } = req.body;
      const task = await Task.create({
        userId: req.user.id,
        title,
        duration,
        deadline,
        status: "pending",
      });
      res.status(201).json(task);
    } catch (error) {
      console.error("Error in addTask:", error);
      res.status(500).json({
        message: "Failed to add task",
        error: error.message,
      });
    }
  };

  const updateTask = async (req, res) => {
    try {
      const { title, duration, deadline, status } = req.body;
      const task = await Task.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });
      if (!task) return res.status(404).json({ message: "Тапсырма табылмады" });

      const wasCompleted =
        task.status !== "completed" && status === "completed";
      const completionTime = wasCompleted
        ? new Date() - new Date(task.createdAt)
        : null;

      task.title = title;
      task.duration = duration;
      task.deadline = deadline;
      task.status = status;
      await task.save();

      // If task was just completed, check for achievements
      if (wasCompleted) {
        await AchievementService.checkAchievements(
          req.user.id,
          "TASK_COMPLETED",
          {
            taskId: task.id,
            completionTime,
          }
        );
      }

      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: "Қате шықты", error: error.message });
    }
  };

  const deleteTask = async (req, res) => {
    try {
      const task = await Task.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });
      if (!task) return res.status(404).json({ message: "Тапсырма табылмады" });

      await task.destroy();
      res.status(200).json({ message: "Тапсырма өшірілді" });
    } catch (error) {
      res.status(500).json({ message: "Қате шықты", error: error.message });
    }
  };

  const getTaskTimeStats = async (req, res) => {
    try {
      const { period } = req.query;
      let startDate, endDate;

      // Calculate date range based on period
      const now = new Date();

      switch (period) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case "week":
        case "thisWeek":
          // Get first day of current week (Sunday)
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          // Get last day of current week (Saturday)
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "thisMonth":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
          break;
        case "lastMonth":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            0,
            23,
            59,
            59,
            999
          );
          break;
        case "month":
          // Last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          // Default to all tasks if period not specified
          startDate = new Date(2020, 0, 1); // Start from 2020
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
      }

      console.log("Debug - User ID:", req.user.id);
      console.log("Debug - Date range:", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // First, let's get ALL tasks for this user to see if they exist
      const allTasks = await Task.findAll({
        where: {
          userId: req.user.id,
        },
        raw: true,
      });

      console.log(
        "Debug - Total tasks for user (without date filter):",
        allTasks.length
      );
      if (allTasks.length > 0) {
        console.log("Debug - Sample task:", {
          id: allTasks[0].id,
          status: allTasks[0].status,
          createdAt: allTasks[0].createdAt,
          userId: allTasks[0].userId,
          deadline: allTasks[0].deadline,
        });
      }

      // Now get tasks within date range
      const tasks = await Task.findAll({
        where: {
          userId: req.user.id,
          [Op.or]: [
            {
              createdAt: {
                [Op.lte]: endDate,
              },
            },
            {
              deadline: {
                [Op.between]: [startDate, endDate],
              },
            },
          ],
        },
        raw: true,
      });

      console.log("Debug - Tasks within date range:", tasks.length);

      // Get unique statuses to understand what we're dealing with
      const uniqueStatuses = [...new Set(tasks.map((t) => t.status))];
      console.log("Debug - Unique statuses found:", uniqueStatuses);

      // Count tasks by status - using more flexible status matching
      const completedTasks = tasks.filter((task) => {
        const status = (task.status || "").toLowerCase().trim();
        return (
          status.includes("complete") ||
          status.includes("аяқтал") ||
          status === "done"
        );
      }).length;

      const incompleteTasks = tasks.filter((task) => {
        const status = (task.status || "").toLowerCase().trim();
        return (
          status.includes("incomplete") ||
          status.includes("аяқталмаған") ||
          status.includes("жоспар") ||
          status === "todo" ||
          status === "new" ||
          !status
        ); // Include tasks with no status as incomplete
      }).length;

      const inProgressTasks = tasks.filter((task) => {
        const status = (task.status || "").toLowerCase().trim();
        return (
          status.includes("progress") ||
          status.includes("орындалуда") ||
          status === "doing" ||
          status === "started"
        );
      }).length;

      const totalTasks = tasks.length;

      console.log("Debug - Task counts:", {
        total: totalTasks,
        completed: completedTasks,
        incomplete: incompleteTasks,
        inProgress: inProgressTasks,
      });

      // Calculate percentages
      const completedPercentage =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const incompletePercentage =
        totalTasks > 0 ? (incompleteTasks / totalTasks) * 100 : 0;
      const inProgressPercentage =
        totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0;

      res.status(200).json({
        debug: {
          userId: req.user.id,
          totalTasksInSystem: allTasks.length,
          uniqueStatuses,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          sampleTask:
            allTasks.length > 0
              ? {
                  createdAt: allTasks[0].createdAt,
                  deadline: allTasks[0].deadline,
                  status: allTasks[0].status,
                }
              : null,
        },
        period: period || "all",
        completedTasks: {
          count: completedTasks,
          percentage: Math.round(completedPercentage * 100) / 100,
        },
        incompleteTasks: {
          count: incompleteTasks,
          percentage: Math.round(incompletePercentage * 100) / 100,
        },
        inProgressTasks: {
          count: inProgressTasks,
          percentage: Math.round(inProgressPercentage * 100) / 100,
        },
        totalTasks,
      });
    } catch (error) {
      console.error("Error in getTaskTimeStats:", error);
      res.status(500).json({
        message: "Error getting task statistics",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  };

  // const checkDeadlines = async () => {
  //   const now = new Date();

  //   const upcomingTasks = await Task.findAll({
  //       where: { deadline: { [Op.gte]: now } }
  //   });

  //   for (let task of upcomingTasks) {
  //       const user = await User.findByPk(task.userId);
  //       if (user) {
  //           await sendEmail(user.email, "Тапсырма ескертуі", `Сіздің "${task.title}" тапсырмаңыздың мерзімі жақындап қалды!`);
  //       }
  //   }
  // };

  // setInterval(checkDeadlines, 3600000);

  module.exports = {
    getTasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskTimeStats,
  };
} catch (moduleError) {
  console.error(
    "Critical error loading modules in taskController:",
    moduleError
  );
  // Export dummy functions that return error responses
  module.exports = {
    getTasks: (req, res) =>
      res.status(500).json({
        message: "Task controller failed to initialize",
        error: moduleError.message,
      }),
    addTask: (req, res) =>
      res.status(500).json({
        message: "Task controller failed to initialize",
        error: moduleError.message,
      }),
    updateTask: (req, res) =>
      res.status(500).json({
        message: "Task controller failed to initialize",
        error: moduleError.message,
      }),
    deleteTask: (req, res) =>
      res.status(500).json({
        message: "Task controller failed to initialize",
        error: moduleError.message,
      }),
    getTaskTimeStats: (req, res) =>
      res.status(500).json({
        message: "Task controller failed to initialize",
        error: moduleError.message,
      }),
  };
}
