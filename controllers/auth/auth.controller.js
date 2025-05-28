const AuthService = require("@services/auth.service");
const responseHelper = require("@helper/response");

exports.login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    responseHelper.successResponse(req, res, "Login successful", result);
  } catch (error) {
    responseHelper.errorResponse(
      req,
      res,
      error.message,
      error.statusCode || 500
    );
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await AuthService.forgotPassword(email);
    responseHelper.successResponse(req, res, "Password reset email sent");
  } catch (error) {
    responseHelper.errorResponse(
      req,
      res,
      error.message,
      error.statusCode || 400
    );
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    await AuthService.resetPassword(email, token, newPassword);
    responseHelper.successResponse(req, res, "Password reset successful");
  } catch (error) {
    responseHelper.errorResponse(
      req,
      res,
      error.message,
      error.statusCode || 400
    );
  }
};
