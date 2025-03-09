"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      `SELECT id from "Users" WHERE email = 'demo@example.com';`
    );
    const userId = users[0][0].id;

    await queryInterface.bulkInsert("Tasks", [
      {
        id: uuidv4(),
        userId: userId,
        title: "Создать бюджет на месяц",
        duration: 30,
        deadline: new Date(),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        userId: userId,
        title: "Анализ расходов за неделю",
        duration: 60,
        deadline: new Date(),
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        userId: userId,
        title: "Планирование инвестиций",
        duration: 120,
        deadline: new Date(),
        status: "completed",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Tasks", null, {});
  },
};
