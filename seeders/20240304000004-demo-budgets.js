"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      `SELECT id from "Users";`
    );
    const userId = users[0][0].id;

    const budgets = [
      {
        id: uuidv4(),
        category: "Продукты",
        amount: 50000,
        spent: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        category: "Транспорт",
        amount: 20000,
        spent: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        category: "Развлечения",
        amount: 30000,
        spent: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        category: "Коммунальные услуги",
        amount: 25000,
        spent: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Budgets", budgets, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Budgets", null, {});
  },
};
