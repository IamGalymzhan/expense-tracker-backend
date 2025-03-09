"use strict";
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    const users = [
      {
        id: uuidv4(),
        name: "Demo User",
        email: "demo@example.com",
        password: hashedPassword,
        preferences: JSON.stringify({
          currency: "USD",
          theme: "light",
          notifications: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Users", users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
