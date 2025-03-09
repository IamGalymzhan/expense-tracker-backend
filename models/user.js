"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Expense, { foreignKey: "userId" });
      this.hasMany(models.Income, { foreignKey: "userId" });
      this.hasMany(models.Task, { foreignKey: "userId" });
      this.hasMany(models.Budget, { foreignKey: "userId" });
      this.hasMany(models.Achievement, { foreignKey: "userId" });
      this.hasMany(models.Category, { foreignKey: "userId" });
      this.hasMany(models.Notification, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      preferences: {
        type: DataTypes.JSONB,
        defaultValue: {
          currency: "USD",
          theme: "light",
          notifications: true,
          language: "kk",
        },
      },
    },
    {
      timestamps: true,
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
