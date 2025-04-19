const translations = {
  notifications: {
    dailyFinanceReminder: {
      kk: "Бүгінгі қаржылық операцияларыңызды қосуды ұмытпаңыз!",
      ru: "Не забудьте добавить ваши финансовые операции за сегодня!",
      en: "Don't forget to add your financial transactions for today!",
    },
    taskReminder: {
      kk: "Ескерту: '{{taskTitle}}' тапсырмасына {{minutesLeft}} минут қалды!",
      ru: "Напоминание: до задачи '{{taskTitle}}' осталось {{minutesLeft}} минут!",
      en: "Reminder: {{minutesLeft}} minutes left until task '{{taskTitle}}' is due!",
    },
  },
};

const getTranslation = (key, language = "kk", placeholders = {}) => {
  const keys = key.split(".");
  let translation = translations;

  for (const k of keys) {
    translation = translation[k];
    if (!translation) return translations.notifications.dailyFinanceReminder.kk; // fallback to Kazakh
  }

  let message = translation[language] || translation.kk; // fallback to Kazakh if language not found

  // Replace placeholders if any
  if (placeholders && Object.keys(placeholders).length > 0) {
    Object.keys(placeholders).forEach((placeholder) => {
      const regex = new RegExp(`{{${placeholder}}}`, "g");
      message = message.replace(regex, placeholders[placeholder]);
    });
  }

  return message;
};

module.exports = {
  translations,
  getTranslation,
};
