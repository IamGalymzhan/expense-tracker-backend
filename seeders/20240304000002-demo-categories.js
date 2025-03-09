"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      `SELECT id from "Users";`
    );
    const userId = users[0][0].id;

    const expenseCategories = [
      {
        id: uuidv4(),
        name: "Продукты",
        type: "expense",
        icon: "shopping-cart",
        color: "#FF6B6B",
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Транспорт",
        type: "expense",
        icon: "car",
        color: "#4ECDC4",
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Развлечения",
        type: "expense",
        icon: "film",
        color: "#45B7D1",
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Коммунальные услуги",
        type: "expense",
        icon: "home",
        color: "#96CEB4",
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const incomeCategories = [
      {
        id: uuidv4(),
        name: "Зарплата",
        type: "income",
        icon: "briefcase",
        color: "#2ECC71",
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Подработка",
        type: "income",
        icon: "laptop",
        color: "#F1C40F",
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Инвестиции",
        type: "income",
        icon: "chart-line",
        color: "#9B59B6",
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert(
      "Categories",
      [...expenseCategories, ...incomeCategories],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Categories", null, {});
  },
};
