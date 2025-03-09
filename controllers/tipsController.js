const { Task, TimeLog } = require("../models");

const getTips = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.id },
      raw: true,
    });
    const timeLogs = await TimeLog.findAll({
      where: { userId: req.user.id },
      raw: true,
    });

    let tips = [];

    if (tasks.length > 5)
      tips.push(
        "Күнделікті тапсырмаларды азайтыңыз, басты мақсаттарға назар аударыңыз."
      );
    if (
      timeLogs.length > 0 &&
      timeLogs.reduce((sum, log) => sum + log.time_spent, 0) > 40
    )
      tips.push("Сіз өте көп жұмыс жасадыңыз, демалыс уақытыңызды реттеңіз.");

    if (tips.length === 0)
      tips.push("Жұмыс кестеңіз жақсы көрінеді! Өзіңізді мақтан тұтыңыз!");

    res.status(200).json({ tips });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

module.exports = { getTips };
