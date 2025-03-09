const { Expense, Income, Budget, Category, sequelize } = require("../models");
const { Op } = require("sequelize");

// Get overview statistics
const getOverviewStats = async (req, res) => {
  try {
    const {
      period,
      startDate: customStartDate,
      endDate: customEndDate,
    } = req.query;
    const where = {
      userId: req.user.id,
    };

    let startDate, endDate;

    // Calculate date range based on period if provided
    if (period) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (period) {
        case "today":
          startDate = today;
          endDate = new Date(today);
          endDate.setDate(today.getDate() + 1);
          break;
        case "week":
        case "thisWeek":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay());
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 7);
          break;
        case "thisMonth":
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case "lastMonth":
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case "month":
          startDate = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            today.getDate()
          );
          endDate = today;
          break;
        default:
          // Use custom dates if provided
          startDate = customStartDate ? new Date(customStartDate) : undefined;
          endDate = customEndDate ? new Date(customEndDate) : undefined;
      }
    } else {
      // Use custom dates if provided without period
      startDate = customStartDate ? new Date(customStartDate) : undefined;
      endDate = customEndDate ? new Date(customEndDate) : undefined;
    }

    // Add date filter if we have start and end dates
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const expenses = await Expense.findAll({ where });
    const incomes = await Income.findAll({ where });

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount),
      0
    );
    const totalIncomes = incomes.reduce(
      (sum, income) => sum + parseFloat(income.amount),
      0
    );
    const balance = totalIncomes - totalExpenses;
    const savingsRate = totalIncomes > 0 ? (balance / totalIncomes) * 100 : 0;

    // Get expense categories breakdown
    const expenseCategories = {};
    expenses.forEach((expense) => {
      expenseCategories[expense.category] =
        (expenseCategories[expense.category] || 0) + parseFloat(expense.amount);
    });

    const expenseBreakdown = Object.entries(expenseCategories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Get income categories breakdown
    const incomeCategories = {};
    incomes.forEach((income) => {
      incomeCategories[income.category] =
        (incomeCategories[income.category] || 0) + parseFloat(income.amount);
    });

    const incomeBreakdown = Object.entries(incomeCategories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalIncomes > 0 ? (amount / totalIncomes) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Format response to match frontend expectations
    res.json({
      totalIncome: totalIncomes,
      totalExpense: totalExpenses,
      savings: balance,
      incomeBreakdown: Object.fromEntries(
        incomeBreakdown.map((item) => [item.category, item.amount])
      ),
      expenseBreakdown: Object.fromEntries(
        expenseBreakdown.map((item) => [item.category, item.amount])
      ),
      // Keep original data for backward compatibility
      balance,
      savingsRate,
      topExpenseCategories: expenseBreakdown.slice(0, 5),
      topIncomeCategories: incomeBreakdown.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
};

// Get monthly statistics
const getMonthlyStats = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    // Validate year
    if (year && (isNaN(year) || year < 1900 || year > 2100)) {
      return res.status(400).json({ message: "Invalid year provided" });
    }

    const where = {
      userId: req.user.id,
      date: {
        [Op.gte]: `${currentYear}-01-01`,
        [Op.lte]: `${currentYear}-12-31`,
      },
    };

    const expenses = await Expense.findAll({ where });
    const incomes = await Income.findAll({ where });

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthExpenses = expenses
        .filter((e) => new Date(e.date).getMonth() + 1 === month)
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const monthIncomes = incomes
        .filter((i) => new Date(i.date).getMonth() + 1 === month)
        .reduce((sum, i) => sum + parseFloat(i.amount), 0);

      return {
        month: new Date(currentYear, i).toLocaleString("default", {
          month: "long",
        }),
        expenses: monthExpenses,
        incomes: monthIncomes,
        balance: monthIncomes - monthExpenses,
      };
    });

    res.json({ monthlyData });
  } catch (error) {
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
};

// Get category breakdown
const getCategoryBreakdown = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const where = {
      userId: req.user.id,
    };

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    let transactions;
    if (type === "expense") {
      transactions = await Expense.findAll({ where });
    } else if (type === "income") {
      transactions = await Income.findAll({ where });
    } else {
      return res.status(400).json({ message: "Type not specified" });
    }

    const categories = {};
    transactions.forEach((transaction) => {
      categories[transaction.category] = categories[transaction.category] || {
        category: transaction.category,
        amount: 0,
        transactions: 0,
      };
      categories[transaction.category].amount += parseFloat(transaction.amount);
      categories[transaction.category].transactions += 1;
    });

    const totalAmount = Object.values(categories).reduce(
      (sum, cat) => sum + cat.amount,
      0
    );
    const result = Object.values(categories).map((cat) => ({
      ...cat,
      percentage: (cat.amount / totalAmount) * 100,
    }));

    res.json({ categories: result });
  } catch (error) {
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
};

// Get daily net income for a specified month
const getDailyNetIncome = async (req, res) => {
  try {
    const { year, month } = req.query;

    // Default to current month and year if not provided
    const currentDate = new Date();
    const currentYear = parseInt(year) || currentDate.getFullYear();
    const currentMonth = parseInt(month) || currentDate.getMonth() + 1;

    // Validate year and month
    if (
      (year &&
        (isNaN(parseInt(year)) ||
          parseInt(year) < 1900 ||
          parseInt(year) > 2100)) ||
      (month &&
        (isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12))
    ) {
      return res
        .status(400)
        .json({ message: "Invalid year or month provided" });
    }

    // Calculate start and end dates for the query
    // Use UTC dates to avoid timezone issues
    const startDate = new Date(
      Date.UTC(currentYear, currentMonth - 1, 1, 0, 0, 0)
    );
    const endDate = new Date(
      Date.UTC(currentYear, currentMonth, 0, 23, 59, 59)
    ); // Last day of the month

    console.log(
      `Fetching data for period: ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    const where = {
      userId: req.user.id,
      date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    // Fetch expenses and incomes for the specified period
    const expenses = await Expense.findAll({ where });
    const incomes = await Income.findAll({ where });

    console.log(
      `Found ${expenses.length} expenses and ${incomes.length} incomes`
    );

    // Initialize result object
    const dailyNetIncome = {};

    // Calculate the number of days in the month
    const daysInMonth = endDate.getUTCDate();

    // Initialize each day with 0 to ensure all days are represented
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(currentYear, currentMonth - 1, day));
      // Format the date consistently
      const dateKey = date.toISOString().split("T")[0] + "T00:00:00.000Z";
      dailyNetIncome[dateKey] = 0;
    }

    // Calculate daily expenses
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      // Format the date consistently
      const dateKey =
        expenseDate.toISOString().split("T")[0] + "T00:00:00.000Z";

      if (dailyNetIncome[dateKey] === undefined) {
        dailyNetIncome[dateKey] = 0;
      }

      dailyNetIncome[dateKey] -= parseFloat(expense.amount);
    });

    // Calculate daily incomes
    incomes.forEach((income) => {
      const incomeDate = new Date(income.date);
      // Format the date consistently
      const dateKey = incomeDate.toISOString().split("T")[0] + "T00:00:00.000Z";

      if (dailyNetIncome[dateKey] === undefined) {
        dailyNetIncome[dateKey] = 0;
      }

      dailyNetIncome[dateKey] += parseFloat(income.amount);
    });

    // Sort the keys to ensure chronological order
    const orderedResult = {};
    Object.keys(dailyNetIncome)
      .sort()
      .forEach((key) => {
        orderedResult[key] = dailyNetIncome[key];
      });

    res.json(orderedResult);
  } catch (error) {
    console.error("Error in getDailyNetIncome:", error);
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
};

// Get financial overview with percentage changes
const getFinancialOverview = async (req, res) => {
  try {
    const { period } = req.query;
    const userId = req.user.id;

    // Calculate current period date range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let currentStartDate, currentEndDate;
    let previousStartDate, previousEndDate;

    // Define date ranges based on period
    switch (period) {
      case "today":
        // Current: Today
        currentStartDate = today;
        currentEndDate = new Date(today);
        currentEndDate.setHours(23, 59, 59, 999);

        // Previous: Yesterday
        previousStartDate = new Date(today);
        previousStartDate.setDate(today.getDate() - 1);
        previousEndDate = new Date(previousStartDate);
        previousEndDate.setHours(23, 59, 59, 999);
        break;

      case "week":
        // Current: Last 7 days
        currentEndDate = new Date(today);
        currentEndDate.setHours(23, 59, 59, 999);
        currentStartDate = new Date(today);
        currentStartDate.setDate(today.getDate() - 6);

        // Previous: 7 days before that
        previousEndDate = new Date(currentStartDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        previousEndDate.setHours(23, 59, 59, 999);
        previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - 6);
        break;

      case "thisWeek":
        // Current: This week (Sunday to Saturday)
        currentStartDate = new Date(today);
        currentStartDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        currentEndDate = new Date(today);
        currentEndDate.setHours(23, 59, 59, 999);

        // Previous: Last week
        previousEndDate = new Date(currentStartDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        previousEndDate.setHours(23, 59, 59, 999);
        previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - 6);
        break;

      case "thisMonth":
        // Current: This month
        currentStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        currentEndDate = new Date(today);
        currentEndDate.setHours(23, 59, 59, 999);

        // Previous: Last month (up to the same day)
        previousEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
        previousEndDate.setHours(23, 59, 59, 999);
        const dayOfMonth = Math.min(today.getDate(), previousEndDate.getDate());
        previousStartDate = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        previousEndDate = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          dayOfMonth
        );
        previousEndDate.setHours(23, 59, 59, 999);
        break;

      case "lastMonth":
        // Current: Last month
        currentStartDate = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        currentEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
        currentEndDate.setHours(23, 59, 59, 999);

        // Previous: Month before last
        previousStartDate = new Date(
          today.getFullYear(),
          today.getMonth() - 2,
          1
        );
        previousEndDate = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          0
        );
        previousEndDate.setHours(23, 59, 59, 999);
        break;

      default:
        // Default to current month if period not specified
        currentStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        currentEndDate = new Date(today);
        currentEndDate.setHours(23, 59, 59, 999);

        // Previous period: Last month (up to the same day)
        previousEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
        previousEndDate.setHours(23, 59, 59, 999);
        const defaultDayOfMonth = Math.min(
          today.getDate(),
          previousEndDate.getDate()
        );
        previousStartDate = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        previousEndDate = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          defaultDayOfMonth
        );
        previousEndDate.setHours(23, 59, 59, 999);
    }

    // Fetch current period data
    const currentExpenses = await Expense.findAll({
      where: {
        userId,
        date: { [Op.between]: [currentStartDate, currentEndDate] },
      },
    });

    const currentIncomes = await Income.findAll({
      where: {
        userId,
        date: { [Op.between]: [currentStartDate, currentEndDate] },
      },
    });

    // Fetch previous period data
    const previousExpenses = await Expense.findAll({
      where: {
        userId,
        date: { [Op.between]: [previousStartDate, previousEndDate] },
      },
    });

    const previousIncomes = await Income.findAll({
      where: {
        userId,
        date: { [Op.between]: [previousStartDate, previousEndDate] },
      },
    });

    // Calculate totals for current period
    const totalExpense = currentExpenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount),
      0
    );
    const totalIncome = currentIncomes.reduce(
      (sum, income) => sum + parseFloat(income.amount),
      0
    );
    const savings = totalIncome - totalExpense;

    // Calculate totals for previous period
    const prevTotalExpense = previousExpenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount),
      0
    );
    const prevTotalIncome = previousIncomes.reduce(
      (sum, income) => sum + parseFloat(income.amount),
      0
    );
    const prevSavings = prevTotalIncome - prevTotalExpense;

    // Calculate percentage changes
    const calculatePercentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const incomePercentChange = calculatePercentChange(
      totalIncome,
      prevTotalIncome
    );
    const expensePercentChange = calculatePercentChange(
      totalExpense,
      prevTotalExpense
    );
    const savingsPercentChange = calculatePercentChange(savings, prevSavings);

    // Fetch all unique categories from database
    // First get all used expense categories
    const allExpenseCategories = await Expense.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("category")), "category"],
      ],
      where: { userId },
    });

    // Get all used income categories
    const allIncomeCategories = await Income.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("category")), "category"],
      ],
      where: { userId },
    });

    // Default categories in case there are no transactions yet
    const defaultExpenseCategories = [
      "Коммуналдық",
      "Азық-түлік",
      "Көлік",
      "Білім",
      "Денсаулық",
      "Киім",
      "Ойын-сауық",
      "Басқа",
    ];

    const defaultIncomeCategories = [
      "Жалақы",
      "Фриланс",
      "Инвестициялар",
      "Сыйлық",
      "Басқа",
    ];

    // Combine extracted categories with defaults
    const expenseCategoryNames = Array.from(
      new Set([
        ...allExpenseCategories.map((cat) => cat.getDataValue("category")),
        ...defaultExpenseCategories,
      ])
    );

    const incomeCategoryNames = Array.from(
      new Set([
        ...allIncomeCategories.map((cat) => cat.getDataValue("category")),
        ...defaultIncomeCategories,
      ])
    );

    // Process expense categories with all possible categories included
    const expenseCategories = {};
    expenseCategoryNames.forEach((category) => {
      expenseCategories[category] = 0; // Initialize all with zero
    });

    // Fill in actual amounts
    currentExpenses.forEach((expense) => {
      expenseCategories[expense.category] += parseFloat(expense.amount);
    });

    // Process income categories with all possible categories included
    const incomeCategories = {};
    incomeCategoryNames.forEach((category) => {
      incomeCategories[category] = 0; // Initialize all with zero
    });

    // Fill in actual amounts
    currentIncomes.forEach((income) => {
      incomeCategories[income.category] += parseFloat(income.amount);
    });

    // Format category data
    const formatCategoryData = (categories, total) => {
      return Object.entries(categories).map(([category, amount]) => ({
        category,
        amount,
        percent: total > 0 ? (amount / total) * 100 : 0,
      }));
    };

    const expenseCategoryData = formatCategoryData(
      expenseCategories,
      totalExpense
    );
    const incomeCategoryData = formatCategoryData(
      incomeCategories,
      totalIncome
    );

    // Return response in the specified format
    res.status(200).json({
      totalIncome,
      totalExpense,
      savings,
      incomePercentChange: parseFloat(incomePercentChange.toFixed(1)),
      expensePercentChange: parseFloat(expensePercentChange.toFixed(1)),
      savingsPercentChange: parseFloat(savingsPercentChange.toFixed(1)),
      categories: {
        income: incomeCategoryData,
        expense: expenseCategoryData,
      },
    });
  } catch (error) {
    console.error("Error in getFinancialOverview:", error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

module.exports = {
  getOverviewStats,
  getMonthlyStats,
  getCategoryBreakdown,
  getDailyNetIncome,
  getFinancialOverview,
};
