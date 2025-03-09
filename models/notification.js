"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: "INFO", // INFO, WARNING, REMINDER, etc.
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      scheduledFor: {
        type: DataTypes.DATE,
        allowNull: true, // For scheduled notifications
      },
    },
    {
      timestamps: true,
      sequelize,
      modelName: "Notification",
    }
  );
  return Notification;
};
