const { Op, sequelize, UniqueConstraintError } = require("sequelize");

const { Company, User, Role, Advertiser, Publisher } = require("@models");
const { generatePassword } = require("@utils/password");
const mailer = require("@utils/mail");
const { serverInfo } = require("@config/config");

exports.createUser = async (req) => {
  let {
    name,
    email,
    password,
    role,
    notify = false,
    number = null,
    status = "Active",
  } = req.body;

  email = email.toLowerCase();
  const companyId = req.user.company_id;

  // Check if email already exists in User, Advertiser, or Publisher tables for the same company
  const existingEmailInUser = await User.findOne({
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("LOWER", sequelize.col("email")), email),
        { company_id: companyId },
      ],
    },
  });

  const existingEmailInAdvertiser = await Advertiser.findOne({
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("LOWER", sequelize.col("email")), email),
        { company_id: companyId },
      ],
    },
  });

  const existingEmailInPublisher = await Publisher.findOne({
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn("LOWER", sequelize.col("email")), email),
        { company_id: companyId },
      ],
    },
  });

  if (
    existingEmailInUser ||
    existingEmailInAdvertiser ||
    existingEmailInPublisher
  ) {
    const error = new Error("Email already exists for this company");
    error.statusCode = 400;
    throw error;
  }

  // Get role data
  const roleData = await Role.findOne({ where: { name: role } });
  if (!roleData) throw new Error("Invalid role provided");

  // Generate and hash password
  const Password = password || generatePassword();

  // Create the user
  try {
    const user = await User.create({
      name,
      email,
      number,
      status,
      password: Password,
      company_id: companyId,
      role_id: roleData.id,
    });

    // Only send email if notify flag is true
    if (notify) {
      const company = await Company.findByPk(companyId);
      if (!company) throw new Error("Company not found");

      const admin = req.user;

      const emailSubject = {
        company_name: company.name,
        app_name: "Afftrex",
      };

      const emailData = {
        app_name: "Afftrex",
        company_name: company.name,
        company_initial: company.name?.[0]?.toUpperCase() || "A",
        employee_name: name,
        employee_email: email,
        employee_password: Password,
        employee_role: roleData.name,
        login_url: `${serverInfo.api_url}/login/${company.subdomain}`,
        admin_name: admin.name,
        admin_role: admin.role?.name || "Admin",
      };

      await mailer.sendMail(email, "employee-welcome", emailSubject, emailData);
    }

    return user;
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      const validationError = new Error("Email already exists");
      validationError.statusCode = 400;
      throw validationError;
    }
    throw error;
  }
};

exports.listCompanyUsers = async (req) => {
  const companyId = req.user.company_id;
  const { search = "", role = "" } = req.query;

  // 1. Fetch current user's role level
  const currentUser = await User.findByPk(req.user.id, {
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["level"],
      },
    ],
  });

  if (!currentUser?.role) {
    throw new Error("Unable to determine current user's role level.");
  }

  const currentUserLevel = currentUser.role.level;

  // 2. Build search condition
  const where = {
    company_id: companyId,
  };

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // 3. Include only roles with level > current user's level
  const include = [
    {
      model: Role,
      as: "role",
      attributes: ["name", "level"],
      where: {
        ...(role ? { name: role } : {}),
        level: { [Op.gt]: currentUserLevel },
      },
    },
  ];

  // 4. Fetch users
  const users = await User.findAll({
    where,
    attributes: ["id", "name", "email", "status", "last_login", "created_at"],
    include,
    order: [["created_at", "DESC"]],
  });

  // 5. Format users to flatten the role object to just the role name
  const formattedUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    last_login: user.last_login,
    created_at: user.created_at,
    role: user.role?.name || null,
  }));

  // 6. Return raw array (not wrapped in `data`)
  return formattedUsers;
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    include: [
      { model: Role, as: "role", attributes: ["name"] },
      {
        model: Company,
        as: "company",
        attributes: ["name", "subdomain"],
      },
    ],
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return user;
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, number, role, status } = req.body;

  const user = await User.findByPk(id);
  if (!user) return "User not found";

  if (role) {
    const roleData = await Role.findOne({ where: { name: role } });
    if (!roleData) return "Invalid role";
    user.role_id = roleData.id;
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.number = number || user.number;
  user.status = status || user.status;

  await user.save();

  return { message: "User updated successfully", user };
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.destroy();

  return "User deleted successfully";
};

exports.changeUserStatus = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  const { status } = req.body;

  if (!["Active", "Inactive"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const user = await User.findByPk(id);
  console.log(user);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.status = status;
  await user.save();

  return `User status updated to ${status}`;
};
