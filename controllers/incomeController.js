const { Income, Category } = require("../models");
const { Op } = require("sequelize");

// Получение списка доходов с пагинацией и фильтрацией
exports.getIncomes = async (req, res) => {
  try {
    const { startDate, endDate, category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      userId: req.user.id,
    };

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (category) {
      where.category = category;
    }

    const { rows } = await Income.findAndCountAll({
      where,
      order: [["date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Добавление нового дохода
exports.addIncome = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const income = await Income.create({
      amount,
      category,
      description,
      date,
      userId: req.user.id,
    });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Получение дохода по ID
exports.getIncomeById = async (req, res) => {
  try {
    const income = await Income.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!income) {
      return res.status(404).json({ message: "Табылмады" });
    }

    res.json(income);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Обновление дохода
exports.updateIncome = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const income = await Income.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!income) {
      return res.status(404).json({ message: "Табылмады" });
    }

    await income.update({
      amount,
      category,
      description,
      date,
    });

    res.json(income);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Удаление дохода
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!income) {
      return res.status(404).json({ message: "Табылмады" });
    }

    await income.destroy();
    res.json({ message: "Сәтті жойылды" });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Получение категорий доходов
exports.getIncomeCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: {
        userId: req.user.id,
        type: "income",
      },
    });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};
