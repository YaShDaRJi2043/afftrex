const { UserPreference } = require("@models");

class UserPreferenceService {
  // Save or update preferences
  static async savePreferences(userId, form, fields) {
    const [preference, created] = await UserPreference.findOrCreate({
      where: { user_id: userId, form },
      defaults: { user_id: userId, form, fields },
    });

    if (!created) {
      // update existing
      await preference.update({ fields });
    }

    return preference;
  }

  // Get preferences
  static async getPreferences(userId, form) {
    return await UserPreference.findOne({
      where: { user_id: userId, form },
    });
  }
}

module.exports = UserPreferenceService;
