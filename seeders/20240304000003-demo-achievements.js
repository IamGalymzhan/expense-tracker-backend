"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      `SELECT id from "Users";`
    );
    const userId = users[0][0].id;

    const achievements = [
      {
        id: uuidv4(),
        title: "Первые шаги",
        description: "Добавьте свой первый расход",
        icon: "star",
        requirements: JSON.stringify({
          type: "expense_count",
          value: 1,
        }),
        userId: userId,
        progress: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Экономист",
        description: "Сэкономьте 20% от дохода за месяц",
        icon: "piggy-bank",
        requirements: JSON.stringify({
          type: "savings_percentage",
          value: 20,
        }),
        userId: userId,
        progress: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Организатор",
        description: "Создайте 5 категорий расходов",
        icon: "folder",
        requirements: JSON.stringify({
          type: "category_count",
          value: 5,
        }),
        userId: userId,
        progress: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Бюджетный мастер",
        description: "Ведите бюджет 3 месяца подряд",
        icon: "trophy",
        requirements: JSON.stringify({
          type: "budget_streak",
          value: 3,
        }),
        userId: userId,
        progress: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Achievements", achievements, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Achievements", null, {});
  },
};
