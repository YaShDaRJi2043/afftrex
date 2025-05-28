const router = require("express").Router();

const authController = require("@controllers/auth/auth.controller");
const {
  loginSchema: loginValidator,
  forgotPasswordSchema: forgotPasswordValidator,
  resetPasswordSchema: resetPasswordValidator,
} = require("@controllers/auth/auth.validator");
const validate = require("@middleware/validate");

router.post("/login", validate(loginValidator), authController.login);

router.post(
  "/forgot-password",
  validate(forgotPasswordValidator),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordValidator),
  authController.resetPassword
);

module.exports = router;
