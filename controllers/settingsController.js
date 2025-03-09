const { User } = require("../models");
const bcrypt = require("bcrypt");

const updateSettings = async (req, res) => {
  try {
    const { language, theme, notifications } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    user.language = language;
    user.theme = theme;
    user.notifications = notifications;
    await user.save();

    res.status(200).json({ message: "Баптаулар жаңартылды" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сохранения настроек", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Неверный старый пароль" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Құпиясөз жаңартылды" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка изменения пароля", error: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["language", "theme"]
    });

    if (!user) {
      return res.status(404).json({ message: "Пайдаланушы табылмады" });
    }

    res.status(200).json({
      language: user.language,
      theme: user.theme,
      notifications: true // Пример (можно хранить в базе)
    });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

module.exports = { updateSettings, changePassword, getSettings };
