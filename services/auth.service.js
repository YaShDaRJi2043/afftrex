const crypto = require("crypto");

const { User, Role, Company } = require("@models/index");
const { generateToken } = require("@root/utils/token");
const mailer = require("@utils/mail");
const { serverInfo } = require("@config/config");

exports.login = async (req) => {
  const { email, password, subdomain } = req;

  const company = await Company.findOne({ where: { subdomain } });
  if (!company) {
    const error = new Error("Invalid company subdomain");
    error.statusCode = 404;
    throw error;
  }

  if (company.status !== "approved") {
    const error = new Error("Company is not approved yet");
    error.statusCode = 403;
    throw error;
  }

  const user = await User.findOne({
    where: {
      email,
      company_id: company.id,
    },
    include: {
      model: Role,
      as: "role",
    },
  });

  if (!user || !(await user.validPassword(password))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
    company: company.name,
  };

  return generateToken(payload);
};

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("No user found with that email");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  user.password_reset_token = resetToken;
  user.password_reset_expiry = expiry;
  await user.save();

  const resetUrl = `${
    serverInfo.front_url
  }reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const emailSubject = { app_name: "Afftrex" };

  const emailData = {
    app_name: "Afftrex",
    user_name: user.name,
    reset_url: resetUrl,
    expiry_time: "5 minutes",
  };

  await mailer.sendMail(user.email, "forgot-password", emailSubject, emailData);

  return { message: "Password reset email sent" };
};

exports.resetPassword = async (email, token, newPassword) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Invalid token or email");

  if (
    !user.password_reset_token ||
    user.password_reset_token !== token ||
    user.password_reset_expiry < new Date()
  ) {
    throw new Error("Invalid or expired password reset token");
  }

  user.password = newPassword;

  user.password_reset_token = null;
  user.password_reset_expiry = null;

  await user.save();

  return { message: "Password has been reset successfully" };
};
