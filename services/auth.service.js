const crypto = require("crypto");

const { User, Role, Company, Publisher, Advertiser } = require("@models/index");
const { generateToken } = require("@root/utils/token");
const mailer = require("@utils/mail");
const { serverInfo } = require("@config/config");

exports.login = async (req) => {
  const { email, password, subdomain } = req;

  const company = await Company.findOne({ where: { subdomain } });
  if (!company) {
    throw newError("Invalid company subdomain", 404);
  }

  if (company.status !== "approved") {
    throw newError("Company is not approved yet", 403);
  }

  // Try User
  let user = await User.findOne({
    where: { email, company_id: company.id },
    include: { model: Role, as: "role" },
  });
  let roleName = user?.role?.name;

  // Try Publisher if not found
  if (!user) {
    user = await Publisher.findOne({
      where: { email, company_id: company.id },
    });
    roleName = "publisher";
  }

  // Try Advertiser if not found
  if (!user) {
    user = await Advertiser.findOne({
      where: { email, company_id: company.id },
    });
    roleName = "advertiser";
  }

  // No match in any model
  if (!user || !(await user.validPassword(password))) {
    throw newError("Invalid email or password", 401);
  }

  if (user.status !== "Active") {
    throw newError("Your account is inactive. Contact admin.", 403);
  }

  // Subscription expiry check (skip for Afftrex or super-admin user)
  const isAfftrex = company.name.toLowerCase() === "afftrex";
  const isSuperAdmin = roleName === "super-admin";

  if (!isAfftrex && !isSuperAdmin) {
    const startDate = new Date(company.subscription_start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + company.subscription_days);
    const now = new Date();
    const remainingDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (remainingDays <= 0) {
      throw newError(
        "Your subscription has expired. Please renew to continue.",
        403
      );
    }
  }

  await user.update({ last_login: new Date() });

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleName,
    company: company.name,
    company_id: company.id,
  };

  return generateToken(payload);
};

function newError(msg, code) {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
}

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
