const { User } = require("../models");

async function updateUserLanguage() {
  try {
    console.log("Starting user language update...");

    const users = await User.findAll();
    console.log(`Found ${users.length} users to update`);

    let updateCount = 0;
    for (const user of users) {
      // Make a deep copy of the preferences
      const preferences = user.preferences ? { ...user.preferences } : {};

      // Update language to Kazakh
      preferences.language = "kk";

      // Save the updated preferences
      user.preferences = preferences;
      await user.save();

      console.log(
        `Updated language for user ${user.name} (${user.id}) to 'kk'`
      );
      updateCount++;
    }

    console.log(`Updated ${updateCount} users to Kazakh language`);
    console.log("User language update completed successfully!");
  } catch (error) {
    console.error("Error updating user language:", error);
  }
}

// Run the script
updateUserLanguage()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
