const { Achievement, User } = require("../models");
const AchievementService = require("../utils/achievementService");
const achievementTranslations = require("../utils/achievementTranslations");

// Helper function to get translated achievement
const getTranslatedAchievement = (achievement, language) => {
  try {
    if (!achievement || !achievement.translationKey) {
      console.log(
        `No translation key for achievement: ${achievement?.title || "unknown"}`
      );
      return achievement;
    }

    console.log(
      `Looking up translation: key=${achievement.translationKey}, language=${language}`
    );

    const [category, key] = achievement.translationKey.split(".");
    console.log(`Split key: category=${category}, key=${key}`);

    // Check if the category exists
    if (!achievementTranslations[category]) {
      console.log(`Category "${category}" not found in translations`);
      return achievement;
    }

    // Check if the key exists in the category
    if (!achievementTranslations[category][key]) {
      console.log(`Key "${key}" not found in category "${category}"`);
      return achievement;
    }

    // Check if the language exists for this key
    if (!achievementTranslations[category][key][language]) {
      console.log(`Language "${language}" not found for "${category}.${key}"`);
      return achievement;
    }

    const translation = achievementTranslations[category][key][language];
    console.log(`Found translation:`, translation);

    if (!translation) {
      console.log(
        `No translation found for ${achievement.translationKey} in ${language}`
      );
      return achievement;
    }

    console.log(`Translating "${achievement.title}" to "${translation.title}"`);

    return {
      ...achievement.toJSON(),
      title: translation.title,
      description: translation.description,
    };
  } catch (error) {
    console.error("Error translating achievement:", error);
    return achievement;
  }
};

// Получение списка достижений
exports.getAchievements = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const language = user.preferences?.language || "kk";

    console.log("User language preference:", language);
    console.log("User preferences:", JSON.stringify(user.preferences));

    const achievements = await Achievement.findAll({
      where: {
        userId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    console.log("First achievement data:", JSON.stringify(achievements[0]));

    const translatedAchievements = achievements.map((achievement) => {
      const translated = getTranslatedAchievement(achievement, language);
      if (achievement.translationKey) {
        console.log(
          `Translation for ${achievement.translationKey} from ${language}:`,
          achievement.title,
          "->",
          translated.title
        );
      }
      return translated;
    });

    res.json({ achievements: translatedAchievements });
  } catch (error) {
    console.error("Achievement error:", error);
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Получение достижения по ID
exports.getAchievementById = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const language = user.preferences?.language || "kk";

    const achievement = await Achievement.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!achievement) {
      return res.status(404).json({ message: "Табылмады" });
    }

    const translatedAchievement = getTranslatedAchievement(
      achievement,
      language
    );
    res.json(translatedAchievement);
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Получение прогресса достижений
exports.getAchievementProgress = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const language = user.preferences?.language || "kk";

    const achievements = await Achievement.findAll({
      where: {
        userId: req.user.id,
      },
    });

    const translatedAchievements = achievements.map((achievement) =>
      getTranslatedAchievement(achievement, language)
    );

    const totalAchievements = translatedAchievements.length;
    const completedAchievements = translatedAchievements.filter(
      (a) => a.completed
    ).length;
    const progress =
      totalAchievements > 0
        ? (completedAchievements / totalAchievements) * 100
        : 0;

    const recentUnlocks = translatedAchievements
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
    const financialAchievements = translatedAchievements.filter(
      (a) => a.icon === "🏆"
    );
    const timeAchievements = translatedAchievements.filter(
      (a) => a.icon === "⏳"
    );

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
    const user = await User.findByPk(req.user.id);
    const language = user.preferences?.language || "kk";
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

    const translatedAchievements = achievements.map((achievement) =>
      getTranslatedAchievement(achievement, language)
    );

    res.json({ achievements: translatedAchievements });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Initialize achievements for a new user
exports.initializeAchievements = async (req, res) => {
  try {
    // Note: Achievements are now automatically initialized when a user registers
    // This endpoint remains for testing or manually initializing achievements for existing users

    // Check if user already has achievements
    const existingAchievements = await Achievement.count({
      where: { userId: req.user.id },
    });

    if (existingAchievements > 0) {
      return res.json({
        message: "User already has achievements initialized",
        count: existingAchievements,
      });
    }

    await AchievementService.createUserAchievements(req.user.id);
    res.json({ message: "Achievements initialized successfully" });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Debug endpoint to check achievement data
exports.debugAchievements = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    console.log(
      "User:",
      JSON.stringify({
        id: user.id,
        name: user.name,
        preferences: user.preferences,
      })
    );

    // Get both template and user achievements for comparison
    const templateAchievements = await Achievement.findAll({
      where: { userId: null },
      limit: 5,
    });

    const userAchievements = await Achievement.findAll({
      where: { userId: req.user.id },
      limit: 5,
    });

    const result = {
      user: {
        id: user.id,
        preferences: user.preferences,
      },
      templateAchievements: templateAchievements.map((a) => ({
        id: a.id,
        title: a.title,
        translationKey: a.translationKey,
      })),
      userAchievements: userAchievements.map((a) => ({
        id: a.id,
        title: a.title,
        translationKey: a.translationKey,
      })),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};
