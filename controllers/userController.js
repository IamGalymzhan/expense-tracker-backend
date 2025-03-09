const { User } = require("../models");
const bcrypt = require("bcrypt");

// Получение профиля пользователя
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Обновление профиля пользователя
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Табылмады" });
    }

    await user.update({
      name,
      preferences: {
        ...user.preferences,
        ...preferences,
      },
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Обновление пароля
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Табылмады" });
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return res.status(400).json({ message: "Қазіргі құпия сөз қате" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: "Құпия сөз сәтті жаңартылды" });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Update user language preference
exports.updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;

    if (!language || (language !== "kk" && language !== "ru")) {
      return res
        .status(400)
        .json({ message: "Invalid language. Use 'kk' or 'ru'." });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Қолданушы табылмады" });
    }

    // Make sure preferences is initialized
    if (!user.preferences) {
      user.preferences = {};
    }

    // Update language preference
    user.preferences = {
      ...user.preferences,
      language,
    };

    await user.save();

    res.status(200).json({
      message:
        language === "kk"
          ? "Тіл параметрі сәтті жаңартылды"
          : "Настройки языка успешно обновлены",
      preferences: user.preferences,
    });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};
