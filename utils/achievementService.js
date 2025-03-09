const {
  Achievement,
  Expense,
  Income,
  Budget,
  Task,
  User,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const {
  differenceInDays,
  isSameDay,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  subMonths,
} = require("date-fns");

/**
 * Achievement service to handle tracking and awarding achievements
 */
class AchievementService {
  /**
   * Check if a user meets requirements for an achievement and award it if they do
   * @param {string} userId - The user's ID
   * @param {string} achievementType - The type of achievement to check
   * @param {Object} data - Additional data needed for checking the achievement
   */
  static async checkAndAwardAchievement(userId, achievementType, data = {}) {
    try {
      // Find all non-completed achievements of the given type for the user
      const achievements = await Achievement.findAll({
        where: {
          userId,
          completed: false,
          requirements: {
            type: achievementType,
          },
        },
      });

      // Check each achievement
      for (const achievement of achievements) {
        const requirements = achievement.requirements;
        let achieved = false;

        // Check if the user meets the requirements based on the achievement type
        switch (achievementType) {
          case "EXPENSE_COUNT":
            achieved = await this.checkExpenseCount(userId, requirements.count);
            break;
          case "EXPENSE_STREAK":
            achieved = await this.checkExpenseStreak(userId, requirements.days);
            break;
          case "BUDGET_ACCURACY":
            achieved = await this.checkBudgetAccuracy(
              userId,
              requirements.threshold
            );
            break;
          case "PERFECT_BALANCE":
            achieved = await this.checkPerfectBalance(userId);
            break;
          case "INCOME_EXCEEDS_EXPENSES":
            achieved = await this.checkIncomeExceedsExpenses(
              userId,
              requirements.months
            );
            break;
          case "EXPENSE_REDUCTION":
            achieved = await this.checkExpenseReduction(
              userId,
              requirements.percentage
            );
            break;
          case "ZERO_EXPENSE_DAY":
            achieved = await this.checkZeroExpenseDay(userId);
            break;
          case "TASK_COMPLETED":
            achieved = await this.checkTasksCompleted(
              userId,
              requirements.count
            );
            break;
          case "TASK_STREAK":
            achieved = await this.checkTaskStreak(userId, requirements.days);
            break;
          case "DEADLINE_MET":
            achieved = await this.checkDeadlineMet(userId, data.taskId);
            break;
          case "FAST_TASK_COMPLETION":
            achieved = await this.checkFastTaskCompletion(
              userId,
              requirements.minutes,
              data.taskId,
              data.completionTime
            );
            break;
          case "TASKS_PER_DAY":
            achieved = await this.checkTasksPerDay(userId, requirements.count);
            break;
          case "TASKS_PER_WEEK":
            achieved = await this.checkTasksPerWeek(userId, requirements.count);
            break;
          case "TASKS_PER_MONTH":
            achieved = await this.checkTasksPerMonth(
              userId,
              requirements.count
            );
            break;
          case "TASKS_COMPLETION_RATE":
            achieved = await this.checkTasksCompletionRate(
              userId,
              requirements.percentage
            );
            break;
          case "TASKS_COMPLETION_RATE_DAY":
            achieved = await this.checkTasksCompletionRateDay(
              userId,
              requirements.percentage
            );
            break;
          case "DEADLINE_STREAK_MONTH":
            achieved = await this.checkDeadlineStreakMonth(
              userId,
              requirements.percentage
            );
            break;
          default:
            break;
        }

        // If the achievement is achieved, update it
        if (achieved) {
          await achievement.update({
            completed: true,
            completedAt: new Date(),
            progress: 100,
          });

          // TODO: Send notification about achievement
        }
      }
    } catch (error) {
      console.error("Error checking and awarding achievement:", error);
    }
  }

  /**
   * Check if user has recorded at least the specified number of expenses
   */
  static async checkExpenseCount(userId, count) {
    const expenseCount = await Expense.count({
      where: { userId },
    });
    return expenseCount >= count;
  }

  /**
   * Check if user has recorded expenses for consecutive days
   */
  static async checkExpenseStreak(userId, days) {
    const today = new Date();
    const expenses = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: subDays(today, days),
        },
      },
      order: [["date", "DESC"]],
    });

    // Group expenses by date to check for consecutive days
    const expenseDates = new Set();
    expenses.forEach((expense) => {
      expenseDates.add(startOfDay(expense.date).getTime());
    });

    let currentStreak = 0;
    for (let i = 0; i < days; i++) {
      const date = startOfDay(subDays(today, i)).getTime();
      if (expenseDates.has(date)) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak >= days;
  }

  /**
   * Check if budget was accurate within the specified threshold percent
   */
  static async checkBudgetAccuracy(userId, threshold) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get the budget for the current month
    const budget = await Budget.findOne({
      where: {
        userId,
        startDate: {
          [Op.lte]: lastDayOfMonth,
        },
        endDate: {
          [Op.gte]: firstDayOfMonth,
        },
      },
    });

    if (!budget) return false;

    // Get the total expenses for the current month
    const expenses = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
      ],
      raw: true,
    });

    const totalExpenses = expenses[0].totalAmount || 0;
    const budgetAmount = budget.amount;

    // Calculate the accuracy percentage
    const accuracyDiff = Math.abs(
      ((totalExpenses - budgetAmount) / budgetAmount) * 100
    );
    return accuracyDiff <= threshold;
  }

  /**
   * Check if income equals expenses exactly (perfect balance)
   */
  static async checkPerfectBalance(userId) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get total expenses for the month
    const expenses = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
      ],
      raw: true,
    });

    // Get total income for the month
    const income = await Income.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
      ],
      raw: true,
    });

    const totalExpenses = parseFloat(expenses[0].totalAmount || 0);
    const totalIncome = parseFloat(income[0].totalAmount || 0);

    // Check if income equals expenses exactly
    return (
      totalExpenses > 0 &&
      totalIncome > 0 &&
      Math.abs(totalIncome - totalExpenses) < 0.01
    );
  }

  /**
   * Check if income exceeds expenses for consecutive months
   */
  static async checkIncomeExceedsExpenses(userId, months) {
    const now = new Date();
    let consecutiveMonths = 0;

    for (let i = 0; i < months; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      // Get total expenses for the month
      const expenses = await Expense.findAll({
        where: {
          userId,
          date: {
            [Op.between]: [monthStart, monthEnd],
          },
        },
        attributes: [
          [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
        ],
        raw: true,
      });

      // Get total income for the month
      const income = await Income.findAll({
        where: {
          userId,
          date: {
            [Op.between]: [monthStart, monthEnd],
          },
        },
        attributes: [
          [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
        ],
        raw: true,
      });

      const totalExpenses = parseFloat(expenses[0].totalAmount || 0);
      const totalIncome = parseFloat(income[0].totalAmount || 0);

      // Check if income exceeds expenses for this month
      if (totalIncome > totalExpenses) {
        consecutiveMonths++;
      } else {
        break;
      }
    }

    return consecutiveMonths >= months;
  }

  /**
   * Check if expenses were reduced by the specified percentage compared to previous month
   */
  static async checkExpenseReduction(userId, percentage) {
    const now = new Date();

    // Current month dates
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Previous month dates
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total expenses for current month
    const currentMonthExpenses = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [currentMonthStart, currentMonthEnd],
        },
      },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
      ],
      raw: true,
    });

    // Get total expenses for previous month
    const previousMonthExpenses = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [previousMonthStart, previousMonthEnd],
        },
      },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
      ],
      raw: true,
    });

    const currentTotal = parseFloat(currentMonthExpenses[0].totalAmount || 0);
    const previousTotal = parseFloat(previousMonthExpenses[0].totalAmount || 0);

    // If there were no expenses in previous month, cannot calculate reduction
    if (previousTotal === 0) return false;

    // Calculate reduction percentage
    const reductionPercentage =
      ((previousTotal - currentTotal) / previousTotal) * 100;
    return reductionPercentage >= percentage;
  }

  /**
   * Check if there was a day with zero expenses
   */
  static async checkZeroExpenseDay(userId) {
    const today = new Date();

    // Check if there are no expenses for the current day
    const expenseCount = await Expense.count({
      where: {
        userId,
        date: {
          [Op.between]: [startOfDay(today), endOfDay(today)],
        },
      },
    });

    return expenseCount === 0;
  }

  /**
   * Check if user has completed at least the specified number of tasks
   */
  static async checkTasksCompleted(userId, count) {
    const taskCount = await Task.count({
      where: {
        userId,
        status: "completed",
      },
    });
    return taskCount >= count;
  }

  /**
   * Check if user has completed tasks for consecutive days
   */
  static async checkTaskStreak(userId, days) {
    const today = new Date();
    const tasks = await Task.findAll({
      where: {
        userId,
        status: "completed",
        updatedAt: {
          [Op.gte]: subDays(today, days),
        },
      },
      attributes: ["updatedAt"],
      order: [["updatedAt", "DESC"]],
    });

    // Group tasks by completion date
    const completionDates = new Set();
    tasks.forEach((task) => {
      completionDates.add(startOfDay(task.updatedAt).getTime());
    });

    let currentStreak = 0;
    for (let i = 0; i < days; i++) {
      const date = startOfDay(subDays(today, i)).getTime();
      if (completionDates.has(date)) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak >= days;
  }

  /**
   * Check if a specific task was completed before deadline
   */
  static async checkDeadlineMet(userId, taskId) {
    if (!taskId) return false;

    const task = await Task.findOne({
      where: {
        id: taskId,
        userId,
        status: "completed",
      },
    });

    if (!task) return false;

    // Check if task was completed before deadline
    return new Date(task.updatedAt) <= new Date(task.deadline);
  }

  /**
   * Check if a task was completed within the specified minutes
   */
  static async checkFastTaskCompletion(
    userId,
    minutes,
    taskId,
    completionTime
  ) {
    if (!taskId || !completionTime) return false;

    // If completionTime is provided, we use it directly
    return completionTime <= minutes * 60 * 1000; // convert minutes to milliseconds
  }

  /**
   * Check if user completed the specified number of tasks in a day
   */
  static async checkTasksPerDay(userId, count) {
    const today = new Date();

    const taskCount = await Task.count({
      where: {
        userId,
        status: "completed",
        updatedAt: {
          [Op.between]: [startOfDay(today), endOfDay(today)],
        },
      },
    });

    return taskCount >= count;
  }

  /**
   * Check if user completed the specified number of tasks in a week
   */
  static async checkTasksPerWeek(userId, count) {
    const now = new Date();
    const oneWeekAgo = subDays(now, 7);

    const taskCount = await Task.count({
      where: {
        userId,
        status: "completed",
        updatedAt: {
          [Op.between]: [oneWeekAgo, now],
        },
      },
    });

    return taskCount >= count;
  }

  /**
   * Check if user completed the specified number of tasks in a month
   */
  static async checkTasksPerMonth(userId, count) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const taskCount = await Task.count({
      where: {
        userId,
        status: "completed",
        updatedAt: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
    });

    return taskCount >= count;
  }

  /**
   * Check if user completed the specified percentage of tasks in a month
   */
  static async checkTasksCompletionRate(userId, percentage) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get total number of tasks for the month
    const totalTasks = await Task.count({
      where: {
        userId,
        createdAt: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
    });

    // Get number of completed tasks for the month
    const completedTasks = await Task.count({
      where: {
        userId,
        status: "completed",
        updatedAt: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
    });

    if (totalTasks === 0) return false;

    const completionRate = (completedTasks / totalTasks) * 100;
    return completionRate >= percentage;
  }

  /**
   * Check if user completed all tasks for the day
   */
  static async checkTasksCompletionRateDay(userId, percentage) {
    const today = new Date();

    // Get total tasks for the day
    const totalTasks = await Task.count({
      where: {
        userId,
        deadline: {
          [Op.between]: [startOfDay(today), endOfDay(today)],
        },
      },
    });

    if (totalTasks === 0) return false;

    // Get completed tasks for the day
    const completedTasks = await Task.count({
      where: {
        userId,
        status: "completed",
        deadline: {
          [Op.between]: [startOfDay(today), endOfDay(today)],
        },
      },
    });

    const completionRate = (completedTasks / totalTasks) * 100;
    return completionRate >= percentage;
  }

  /**
   * Check if all tasks for the month were completed on time
   */
  static async checkDeadlineStreakMonth(userId, percentage) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all completed tasks for the month
    const tasks = await Task.findAll({
      where: {
        userId,
        status: "completed",
        updatedAt: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
    });

    if (tasks.length === 0) return false;

    // Count how many were completed on time
    const onTimeCount = tasks.filter(
      (task) => new Date(task.updatedAt) <= new Date(task.deadline)
    ).length;
    const onTimeRate = (onTimeCount / tasks.length) * 100;

    return onTimeRate >= percentage;
  }

  /**
   * Create user achievement records for a new user
   * @param {string} userId - The user's ID
   */
  static async createUserAchievements(userId) {
    try {
      // Get all achievements
      const achievementTemplates = await Achievement.findAll({
        where: {
          userId: null,
        },
      });

      // Create achievements for the user with translation keys
      const userAchievements = achievementTemplates.map((template) => {
        let translationKey = null;

        // Determine translation key based on requirements type
        switch (template.requirements.type) {
          case "EXPENSE_COUNT":
            if (template.requirements.count === 1) {
              translationKey = "financial.first_note";
            }
            break;
          case "EXPENSE_STREAK":
            if (template.requirements.days === 7) {
              translationKey = "financial.finance_way_started";
            } else if (template.requirements.days === 30) {
              translationKey = "financial.responsible";
            }
            break;
          case "TASK_COMPLETED":
            if (template.requirements.count === 1) {
              translationKey = "time.first_task";
            }
            break;
          case "TASK_STREAK":
            if (template.requirements.days === 30) {
              translationKey = "time.month_without_miss";
            }
            break;
          case "DEADLINE_MET":
            translationKey = "time.deadline_met";
            break;
        }

        return {
          title: template.title,
          description: template.description,
          icon: template.icon,
          imagePath: template.imagePath,
          requirements: template.requirements,
          translationKey,
          userId,
          progress: 0,
          completed: false,
        };
      });

      await Achievement.bulkCreate(userAchievements);
    } catch (error) {
      console.error("Error creating user achievements:", error);
    }
  }

  /**
   * Check for achievements after relevant actions
   * @param {string} userId - The user's ID
   * @param {string} action - The action that triggered the check (expense, task, etc.)
   * @param {Object} data - Additional data needed for checking achievements
   */
  static async checkAchievements(userId, action, data = {}) {
    switch (action) {
      case "EXPENSE_CREATED":
        await this.checkAndAwardAchievement(userId, "EXPENSE_COUNT");
        await this.checkAndAwardAchievement(userId, "EXPENSE_STREAK");
        break;
      case "DAY_COMPLETED":
        await this.checkAndAwardAchievement(userId, "ZERO_EXPENSE_DAY");
        await this.checkAndAwardAchievement(
          userId,
          "TASKS_COMPLETION_RATE_DAY"
        );
        await this.checkAndAwardAchievement(userId, "TASKS_PER_DAY");
        break;
      case "MONTH_COMPLETED":
        await this.checkAndAwardAchievement(userId, "BUDGET_ACCURACY");
        await this.checkAndAwardAchievement(userId, "PERFECT_BALANCE");
        await this.checkAndAwardAchievement(userId, "INCOME_EXCEEDS_EXPENSES");
        await this.checkAndAwardAchievement(userId, "EXPENSE_REDUCTION");
        await this.checkAndAwardAchievement(userId, "TASKS_COMPLETION_RATE");
        await this.checkAndAwardAchievement(userId, "TASKS_PER_MONTH");
        await this.checkAndAwardAchievement(userId, "DEADLINE_STREAK_MONTH");
        break;
      case "WEEK_COMPLETED":
        await this.checkAndAwardAchievement(userId, "TASKS_PER_WEEK");
        break;
      case "TASK_COMPLETED":
        await this.checkAndAwardAchievement(userId, "TASK_COMPLETED");
        await this.checkAndAwardAchievement(userId, "TASK_STREAK");
        await this.checkAndAwardAchievement(userId, "DEADLINE_MET", {
          taskId: data.taskId,
        });
        await this.checkAndAwardAchievement(userId, "FAST_TASK_COMPLETION", {
          taskId: data.taskId,
          completionTime: data.completionTime,
        });
        break;
      default:
        break;
    }
  }
}

module.exports = AchievementService;
