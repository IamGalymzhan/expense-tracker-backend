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
