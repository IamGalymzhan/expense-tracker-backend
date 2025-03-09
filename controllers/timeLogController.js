const { TimeLog } = require("../models");

const getTimeLogs = async (req, res) => {
  try {
    const timeLogs = await TimeLog.findAll({ where: { userId: req.user.id } });
    res.status(200).json(timeLogs);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

const addTimeLog = async (req, res) => {
  try {
    const { taskId, time_spent, date } = req.body;
    const timeLog = await TimeLog.create({
      userId: req.user.id,
      taskId,
      time_spent,
      date,
    });
    res.status(201).json(timeLog);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

module.exports = { getTimeLogs, addTimeLog };
