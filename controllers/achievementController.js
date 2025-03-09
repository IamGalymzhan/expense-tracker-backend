const { Achievement } = require("../models");
const AchievementService = require("../utils/achievementService");

// Получение списка достижений
exports.getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.findAll({
      where: {
        userId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });
    res.json({ achievements });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Получение достижения по ID
exports.getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!achievement) {
      return res.status(404).json({ message: "Табылмады" });
    }

    res.json(achievement);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Получение прогресса достижений
exports.getAchievementProgress = async (req, res) => {
  try {
    const achievements = await Achievement.findAll({
      where: {
        userId: req.user.id,
      },
    });

    const totalAchievements = achievements.length;
    const completedAchievements = achievements.filter(
      (a) => a.completed
    ).length;
    const progress =
      totalAchievements > 0
        ? (completedAchievements / totalAchievements) * 100
        : 0;

    const recentUnlocks = achievements
      .filter((a) => a.completed && a.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .map((a) => ({
        achievement: {
          id: a.id,
          title: a.title,
          description: a.description,
          icon: a.icon,
        },
        unlockedAt: a.completedAt,
      }));

    // Group achievements by category (financial vs time)
    const financialAchievements = achievements.filter((a) => a.icon === "🏆");
    const timeAchievements = achievements.filter((a) => a.icon === "⏳");

    // Calculate category progress
    const financialProgress =
      financialAchievements.length > 0
        ? (financialAchievements.filter((a) => a.completed).length /
            financialAchievements.length) *
          100
        : 0;

    const timeProgress =
      timeAchievements.length > 0
        ? (timeAchievements.filter((a) => a.completed).length /
            timeAchievements.length) *
          100
        : 0;

    res.json({
      totalAchievements,
      completedAchievements,
      progress,
      financialProgress,
      timeProgress,
      recentUnlocks,
    });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Get achievements by category (financial or time)
exports.getAchievementsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    let icon;

    if (category === "financial") {
      icon = "🏆";
    } else if (category === "time") {
      icon = "⏳";
    } else {
      return res
        .status(400)
        .json({ message: "Invalid category. Use 'financial' or 'time'." });
    }

    const achievements = await Achievement.findAll({
      where: {
        userId: req.user.id,
        icon,
      },
      order: [
        ["completed", "ASC"],
        ["title", "ASC"],
      ],
    });

    res.json({ achievements });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Initialize achievements for a new user
exports.initializeAchievements = async (req, res) => {
  try {
    await AchievementService.createUserAchievements(req.user.id);
    res.json({ message: "Achievements initialized successfully" });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};
