const { Achievement } = require("../models");
const { Op } = require("sequelize");

async function updateAchievementTranslationKeys() {
  try {
    console.log("Starting achievement translation key update...");

    // Get all user achievements
    const userAchievements = await Achievement.findAll({
      where: {
        userId: {
          [Op.not]: null,
        },
      },
    });

    console.log(`Found ${userAchievements.length} user achievements to update`);

    // Mapping for all achievement types
    const translationKeyMap = {
      // Financial achievements
      EXPENSE_COUNT_1: "financial.first_note",
      EXPENSE_STREAK_7: "financial.finance_way_started",
      EXPENSE_STREAK_30: "financial.responsible",
      EXPENSE_STREAK_90: "financial.discipline",
      BUDGET_ACCURACY_15: "financial.economist",
      PERFECT_BALANCE: "financial.clean_balance",
      INCOME_EXCEEDS_EXPENSES_3: "financial.stability",
      EXPENSE_REDUCTION_10: "financial.expense_cut",
      EXPENSE_REDUCTION_25: "financial.budget_captain",
      ZERO_EXPENSE_DAY: "financial.zero_expense_day",

      // Time achievements
      TASK_COMPLETED_1: "time.first_task",
      TASK_STREAK_7: "time.task_streak",
      TASK_STREAK_30: "time.month_without_miss",
      DEADLINE_MET: "time.deadline_met",
      FAST_TASK_COMPLETION_30: "time.fast_task_completion",
      TASKS_PER_DAY_5: "time.tasks_per_day",
      TASKS_PER_DAY_10: "time.breakthrough",
      TASKS_PER_WEEK_20: "time.tasks_per_week",
      TASKS_PER_WEEK_50: "time.flow_week",
      TASKS_PER_MONTH_200: "time.tasks_per_month",
      TASKS_COMPLETION_RATE_90: "time.tasks_completion_rate",
      TASKS_COMPLETION_RATE_DAY_100: "time.tasks_completion_rate_day",
      DEADLINE_STREAK_MONTH_100: "time.deadline_streak_month",
    };

    // Update each user achievement
    let updateCount = 0;
    for (const achievement of userAchievements) {
      const requirements = achievement.requirements;
      let key = requirements.type;

      // Add additional identifiers for specific types
      if (requirements.count) {
        key += `_${requirements.count}`;
      } else if (requirements.days) {
        key += `_${requirements.days}`;
      } else if (requirements.threshold) {
        key += `_${requirements.threshold}`;
      } else if (requirements.percentage) {
        key += `_${requirements.percentage}`;
      } else if (requirements.months) {
        key += `_${requirements.months}`;
      } else if (requirements.minutes) {
        key += `_${requirements.minutes}`;
      }

      const translationKey = translationKeyMap[key];

      if (translationKey) {
        console.log(
          `Setting translation key for "${achievement.title}" (${key}) -> "${translationKey}"`
        );
        achievement.translationKey = translationKey;
        await achievement.save();
        updateCount++;
      } else {
        console.log(
          `No translation key found for type: ${key} (${
            achievement.title
          }). Title="${achievement.title}", Requirements=${JSON.stringify(
            requirements
          )}`
        );
      }
    }

    console.log(
      `Updated ${updateCount} user achievements with translation keys`
    );
    console.log("Script completed successfully!");
  } catch (error) {
    console.error("Error updating achievement translation keys:", error);
  }
}

// Run the script
updateAchievementTranslationKeys()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
