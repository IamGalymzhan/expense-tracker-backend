const cron = require("node-cron");
const { User } = require("../models");
const AchievementService = require("./achievementService");

// Schedule daily achievement checks at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running daily achievement checks...");
    const users = await User.findAll();

    for (const user of users) {
      await AchievementService.checkAchievements(user.id, "DAY_COMPLETED");
    }
  } catch (error) {
    console.error("Error running daily achievement checks:", error);
  }
});

// Schedule weekly achievement checks at midnight on Sunday
cron.schedule("0 0 * * 0", async () => {
  try {
    console.log("Running weekly achievement checks...");
    const users = await User.findAll();

    for (const user of users) {
      await AchievementService.checkAchievements(user.id, "WEEK_COMPLETED");
    }
  } catch (error) {
    console.error("Error running weekly achievement checks:", error);
  }
});

// Schedule monthly achievement checks at midnight on the first day of each month
cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Running monthly achievement checks...");
    const users = await User.findAll();

    for (const user of users) {
      await AchievementService.checkAchievements(user.id, "MONTH_COMPLETED");
    }
  } catch (error) {
    console.error("Error running monthly achievement checks:", error);
  }
});
