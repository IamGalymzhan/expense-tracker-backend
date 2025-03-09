const translations = {
  notifications: {
    dailyFinanceReminder: {
      kk: "Бүгінгі қаржылық операцияларыңызды қосуды ұмытпаңыз!",
      ru: "Не забудьте добавить ваши финансовые операции за сегодня!",
      en: "Don't forget to add your financial transactions for today!",
    },
  },
};

const getTranslation = (key, language = "kk") => {
  const keys = key.split(".");
  let translation = translations;

  for (const k of keys) {
    translation = translation[k];
    if (!translation) return translations.notifications.dailyFinanceReminder.kk; // fallback to Kazakh
  }

  return translation[language] || translation.kk; // fallback to Kazakh if language not found
};

module.exports = {
  translations,
  getTranslation,
};
