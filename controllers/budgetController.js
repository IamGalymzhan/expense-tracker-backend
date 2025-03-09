const { Budget, Expense } = require("../models");
const { Op } = require("sequelize");

// Получение списка бюджетов
exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const where = {
      userId: req.user.id,
    };

    if (month && year) {
      where.month = month;
      where.year = year;
    }

    const budgets = await Budget.findAll({ where });
    res.json({ budgets });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Добавление нового бюджета
exports.addBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    const budget = await Budget.create({
      category,
      amount,
      month,
      year,
      userId: req.user.id,
    });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Обновление бюджета
exports.updateBudget = async (req, res) => {
  try {
    const { amount, category } = req.body;
    const budget = await Budget.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!budget) {
      return res.status(404).json({ message: "Табылмады" });
    }

    await budget.update({
      amount,
      category,
    });

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Удаление бюджета
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!budget) {
      return res.status(404).json({ message: "Табылмады" });
    }

    await budget.destroy();
    res.json({ message: "Сәтті жойылды" });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};
