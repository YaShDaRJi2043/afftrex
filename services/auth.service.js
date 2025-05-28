const crypto = require("crypto");

const { User, Role, Permission } = require("@models/index");
const { generateToken } = require("@root/utils/token");
const mailer = require("@utils/mail");
const { serverInfo } = require("@config/config");

exports.login = async (req) => {
  const { email, password } = req;

  // Find user and include role
  const user = await User.findOne({
    where: { email },
    include: {
      model: Role,
      as: "role",
    },
  });

  // Check user credentials
  if (!user || !(await user.validPassword(password))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Get role and permission IDs
  const role = user.role;
  const permissionIds = role?.permissions_id || [];

  // Fetch actual permission objects
  const permissions = await Permission.findAll({
    where: {
      id: permissionIds,
    },
  });

  // Prepare permission names array (optional)
  const permissionNames = permissions.map((perm) => perm.name);

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: role.name,
    permissions: permissionNames,
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
  }/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

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
