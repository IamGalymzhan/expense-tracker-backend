const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const AchievementService = require("../utils/achievementService");

const register = async (req, res) => {
  try {
    const { name, email, password, preferences } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Бұл email тіркелген" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      preferences: preferences || {
        currency: "USD",
        theme: "light",
        notifications: true,
      },
    });

    // Initialize achievements for the new user
    await AchievementService.createUserAchievements(newUser.id);
    console.log(`Achievements initialized for new user: ${newUser.id}`);

    res
      .status(201)
      .json({ message: "Пайдаланушы сәтті тіркелді", user: newUser });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Сервер қатесі", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Қолданушы табылмады" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Қате құпиясөз" });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Created token for user:", user.id);
    console.log("Token structure:", JSON.stringify(jwt.decode(token)));

    res.status(200).json({
      message: "Кіру сәтті аяқталды",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Сервер қатесі", error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "preferences"],
    });
    if (!user) return res.status(404).json({ message: "Қолданушы табылмады" });

    const { language, theme } = user.preferences;
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      language,
      theme,
    });
  } catch (error) {
    res.status(500).json({ message: "Сервер қатесі", error: error.message });
  }
};

module.exports = { register, login, getUserProfile };
