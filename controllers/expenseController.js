const { Expense } = require("../models");
const AchievementService = require("../utils/achievementService");

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
      },
      order: [["date", "DESC"]],
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

const addExpense = async (req, res) => {
  try {
    const { category, amount, date, note } = req.body;
    const expense = await Expense.create({
      userId: req.user.id,
      category,
      amount,
      date,
      note,
    });

    // Check for achievements after adding an expense
    await AchievementService.checkAchievements(req.user.id, "EXPENSE_CREATED");

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

const editExpense = async (req, res) => {
  try {
    const { category, amount, date, note } = req.body;
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!expense) return res.status(404).json({ message: "Шығын табылмады" });

    expense.category = category;
    expense.amount = amount;
    expense.date = date;
    expense.note = note;
    await expense.save();

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!expense) return res.status(404).json({ message: "Шығын табылмады" });

    await expense.destroy();
    res.status(200).json({ message: "Шығын өшірілді" });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

module.exports = { getExpenses, addExpense, editExpense, deleteExpense };
