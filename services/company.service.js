const { Op } = require("sequelize");

const { Company, User, Role } = require("@models");
const { uploadToS3 } = require("@utils/s3");
const { generatePassword } = require("@utils/password");
const mailer = require("@utils/mail");
const { serverInfo } = require("@config/config");

exports.LoginInfo = async (req, res) => {
  try {
    const company = await Company.findOne({
      where: { subdomain: req.query.subdomain },
      attributes: ["name", "logo"],
    });

    console.log(company);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    return company;
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.register = async (req) => {
  const { name, admin_email, subdomain } = req.body;
  const file = req.file;

  const logoFileName = file
    ? await uploadToS3(file.buffer, file.originalname)
    : null;

  const company = await Company.create({
    name,
    admin_email,
    subdomain,
    logo: logoFileName,
  });

  return company;
};

//for super-admin
exports.approve = async (companyId) => {
  const company = await Company.findOne({
    where: {
      id: companyId.params.id,
    },
  });
  if (!company) throw new Error("Company not found");

  company.status = "approved";
  await company.save();

  const password = generatePassword();
  const headAdminRole = await Role.findOne({ where: { name: "head-admin" } });

  const user = await User.create({
    name: `${company.name} Admin`,
    email: company.admin_email,
    password,
    role_id: headAdminRole.id,
    company_id: company.id,
  });

  // 👇 Use the company subdomain to generate a unique login URL
  const resetUrl = `${serverInfo.api_url}/login/${company.subdomain}`;

  const emailSubject = { app_name: "Afftrex" };
  const emailData = {
    app_name: "Afftrex",
    user_name: user.name,
    user_email: user.email,
    user_password: password,
    dashboard_url: resetUrl,
  };

  await mailer.sendMail(user.email, "welcome-email", emailSubject, emailData);

  return user;
};

exports.list = async (req, res) => {
  try {
    const {
      search = "",
      status,
      page = 1,
      limit = 10,
      sort_by = "created_at",
      order = "DESC",
    } = req.query;

    const where = {};

    // Filter by status
    if (status) {
      where.status = status.toLowerCase();
    }

    // Search by name or admin_email
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { admin_email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const result = await Company.paginate({
      page: page,
      paginate: limit,
      where,
      order: [[sort_by, order.toUpperCase()]],
    });

    return result.docs;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
