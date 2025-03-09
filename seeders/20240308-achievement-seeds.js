"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Define financial achievements
    const financialAchievements = [
      {
        id: uuidv4(),
        title: "Первая запись",
        description:
          "Поздравляем! Вы сделали первый шаг к финансовому учёту, записав свою первую трату. Теперь контроль над бюджетом в ваших руках!",
        icon: "🏆",
        imagePath: "assets/achievements/first_note.png",
        translationKey: "financial.first_note",
        requirements: {
          type: "EXPENSE_COUNT",
          count: 1,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Финансовый путь начат",
        description:
          "Вы неделю фиксируете свои расходы! Это начало осознанного управления деньгами. Главное — не останавливаться!",
        icon: "🏆",
        imagePath: "assets/achievements/finance_way_started.png",
        translationKey: "financial.finance_way_started",
        requirements: {
          type: "EXPENSE_STREAK",
          days: 7,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Ответственный",
        description:
          "Вы записывали расходы каждый день на протяжении месяца! Отличная привычка, которая поможет вам анализировать и управлять финансами.",
        icon: "🏆",
        imagePath: "assets/achievements/month_without_miss.png",
        translationKey: "financial.responsible",
        requirements: {
          type: "EXPENSE_STREAK",
          days: 30,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Дисциплина №1",
        description:
          "Вы три месяца фиксировали все расходы без единого пропуска! Такой уровень дисциплины приближает вас к финансовой свободе.",
        icon: "🏆",
        imagePath: "assets/achievements/discipline.png",
        requirements: {
          type: "EXPENSE_STREAK",
          days: 90,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Экономист",
        description:
          "Вы точно спланировали свой бюджет, и фактические расходы оказались в пределах 15% от запланированных! Вы настоящий мастер финансового планирования.",
        icon: "🏆",
        imagePath: "assets/achievements/economist.png",
        requirements: {
          type: "BUDGET_ACCURACY",
          threshold: 15,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Чистый баланс",
        description:
          "Ваши доходы и расходы полностью сбалансированы! Поздравляем, вы достигли идеального управления бюджетом.",
        icon: "🏆",
        imagePath: "assets/achievements/clean_balance.png",
        requirements: {
          type: "PERFECT_BALANCE",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Стабильность",
        description:
          "Три месяца подряд ваши доходы превышают расходы! Это уверенный шаг к финансовой независимости.",
        icon: "🏆",
        imagePath: "assets/achievements/stability.png",
        requirements: {
          type: "INCOME_EXCEEDS_EXPENSES",
          months: 3,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Снижение трат",
        description:
          "Отличная работа! В этом месяце вы потратили на 10% меньше, чем в предыдущем. Ваша финансовая стратегия работает!",
        icon: "🏆",
        imagePath: "assets/achievements/expense_cut.png",
        requirements: {
          type: "EXPENSE_REDUCTION",
          percentage: 10,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Капитан бюджета",
        description:
          "Вы мастерски сократили расходы на 25%! Финансовая дисциплина помогает вам двигаться к новым целям.",
        icon: "🏆",
        imagePath: "assets/achievements/budget_captain.png",
        requirements: {
          type: "EXPENSE_REDUCTION",
          percentage: 25,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Ноль трат",
        description:
          "День без единой траты! Иногда это необходимо, чтобы укрепить самоконтроль и не поддаваться импульсивным покупкам.",
        icon: "🏆",
        imagePath: "assets/achievements/zero_expense.png",
        requirements: {
          type: "ZERO_EXPENSE_DAY",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Define time achievements
    const timeAchievements = [
      {
        id: uuidv4(),
        title: "Первая задача",
        description:
          "Вы закрыли свою первую задачу! Это начало вашей продуктивной работы.",
        icon: "⏳",
        imagePath: "assets/achievements/first_task.png",
        translationKey: "time.first_task",
        requirements: {
          type: "TASK_COMPLETED",
          count: 1,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Месяц без пропусков",
        description:
          "Вы выполняли задачи каждый день в течение месяца! Дисциплина – ключ к успеху.",
        icon: "⏳",
        imagePath: "assets/achievements/month_without_miss.png",
        requirements: {
          type: "TASK_STREAK",
          days: 30,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Закрыл дедлайн",
        description:
          "Вы успели выполнить важную задачу вовремя! Теперь дедлайны вам не страшны.",
        icon: "⏳",
        imagePath: "assets/achievements/meet_deadline.png",
        requirements: {
          type: "DEADLINE_MET",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Рекорд скорости",
        description:
          "Вы справились с задачей за 30 минут или быстрее! Отличный результат и высокая эффективность!",
        icon: "⏳",
        imagePath: "assets/achievements/speed_record.png",
        requirements: {
          type: "FAST_TASK_COMPLETION",
          minutes: 30,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Прорыв",
        description:
          "Вы закрыли 10 задач за один день! Это был настоящий рывок к продуктивности.",
        icon: "⏳",
        imagePath: "assets/achievements/breakthrough.png",
        requirements: {
          type: "TASKS_PER_DAY",
          count: 10,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Неделя в потоке",
        description:
          "За неделю вы выполнили 50 задач! Вы находитесь в состоянии продуктивного потока.",
        icon: "⏳",
        imagePath: "assets/achievements/month_of_flow.png",
        requirements: {
          type: "TASKS_PER_WEEK",
          count: 50,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Месяц продуктивности",
        description:
          "Поздравляем! За месяц вы завершили 200 задач. Это впечатляющий результат!",
        icon: "⏳",
        imagePath: "assets/achievements/month_of_productivity.png",
        requirements: {
          type: "TASKS_PER_MONTH",
          count: 200,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Железная дисциплина",
        description:
          "Вы успешно закрыли 90% всех задач в течение месяца! Это требует силы воли и отличного тайм-менеджмента. Вы заслужили молот Тора-Мьельнира!",
        icon: "⏳",
        imagePath: "assets/achievements/iron_discipline.png",
        requirements: {
          type: "TASKS_COMPLETION_RATE",
          percentage: 90,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Контроль дня",
        description:
          "Вы выполнили все запланированные задачи за день! Полный контроль над своим временем – это ценный навык.",
        icon: "⏳",
        imagePath: "assets/achievements/control_day.png",
        requirements: {
          type: "TASKS_COMPLETION_RATE_DAY",
          percentage: 100,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Мастер дедлайнов",
        description:
          "Вы не сорвали ни одного дедлайна за месяц! Это настоящий показатель ответственности и профессионализма.",
        icon: "⏳",
        imagePath: "assets/achievements/deadline_master.png",
        requirements: {
          type: "DEADLINE_STREAK_MONTH",
          percentage: 100,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Convert requirements to JSON strings for all achievements
    const achievementsToInsert = [
      ...financialAchievements,
      ...timeAchievements,
    ].map((achievement) => ({
      ...achievement,
      requirements: JSON.stringify(achievement.requirements),
    }));

    // Insert all achievements
    await queryInterface.bulkInsert("Achievements", achievementsToInsert, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Achievements", null, {});
  },
};
