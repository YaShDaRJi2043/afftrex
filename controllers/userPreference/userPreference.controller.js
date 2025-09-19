const UserPreferenceService = require("@services/userPreference.service");
const responseHelper = require("@helper/response");

exports.savePreferences = async (req, res) => {
  try {
    const { form, fields } = req.body;
    const userId = req.user.id;

    const preference = await UserPreferenceService.savePreferences(
      userId,
      form,
      fields
    );

    responseHelper.successResponse(
      req,
      res,
      "Preferences saved successfully",
      preference,
      201
    );
  } catch (err) {
    console.error("Save preferences error:", err);
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const { form } = req.params;
    const userId = req.user.id;

    const preference = await UserPreferenceService.getPreferences(userId, form);

    if (!preference) {
      return responseHelper.errorResponse(
        req,
        res,
        "Preferences not found",
        404
      );
    }

    responseHelper.successResponse(
      req,
      res,
      "Preferences fetched successfully",
      preference
    );
  } catch (err) {
    console.error("Get preferences error:", err);
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};
