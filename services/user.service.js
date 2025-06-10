const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const { Company, User, Role } = require("@models");
const { generatePassword } = require("@utils/password");
const mailer = require("@utils/mail");
const { serverInfo } = require("@config/config");

exports.createUser = async (req) => {
  const {
    name,
    email,
    password,
    role,
    notify = false,
    number = null,
    status = "Active",
  } = req.body;

  const companyId = req.user.company_id;

  // Get role data
  const roleData = await Role.findOne({ where: { name: role } });
  if (!roleData) throw new Error("Invalid role provided");

  // Generate and hash password
  const plainPassword = password || generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Create the user
  const user = await User.create({
    name,
    email,
    number,
    status,
    password: hashedPassword,
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
      employee_password: plainPassword,
      employee_role: roleData.name,
      login_url: `${serverInfo.api_url}/login/${company.subdomain}`,
      admin_name: admin.name,
      admin_role: admin.role?.name || "Admin",
    };

    await mailer.sendMail(email, "employee-welcome", emailSubject, emailData);
  }

  return user;
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

  if (!currentUser || !currentUser.role) {
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

  // 3. Include users only with role level < current user's level
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

  return users;
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        { model: Role, as: "role", attributes: ["id", "name"] },
        {
          model: Company,
          as: "company",
          attributes: ["id", "name", "subdomain"],
        },
      ],
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, number, role, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (role) {
      const roleData = await Role.findOne({ where: { name: role } });
      if (!roleData) return res.status(400).json({ message: "Invalid role" });
      user.role_id = roleData.id;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.number = number || user.number;
    user.status = status || user.status;

    await user.save();

    return res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();

    return res
      .status(200)
      .json({ message: `User status updated to ${status}` });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
