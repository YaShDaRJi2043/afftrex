const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const { Advertiser, Company } = require("@models");
const { generatePassword } = require("@utils/password");
const mailer = require("@utils/mail");
const { serverInfo } = require("@config/config");

exports.createAdvertiser = async (req) => {
  const {
    full_name,
    email,
    password,
    notify = false,
    status = "Active", // Override default if needed
    reference_id = null,
    account_manager = null,
    notes = null,
  } = req.body;

  const companyId = req.user.company_id;

  // Generate and hash password
  const plainPassword = password || generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Create advertiser
  const advertiser = await Advertiser.create({
    full_name,
    email,
    password: hashedPassword,
    status,
    reference_id,
    account_manager,
    notes,
    company_id: companyId,
  });

  // Send email if notify is true
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
      employee_name: full_name,
      employee_email: email,
      employee_password: plainPassword,
      employee_role: "Advertiser",
      login_url: `${serverInfo.api_url}/login/${company.subdomain}`,
      admin_name: admin.name,
      admin_role: admin.role?.name || "Admin",
    };

    await mailer.sendMail(email, "employee-welcome", emailSubject, emailData);
  }

  return advertiser;
};

exports.getAllAdvertisers = async (req) => {
  const filters = req.body;
  const companyId = req.user.company.id;

  const stringFields = [
    "full_name",
    "email",
    "reference_id",
    "account_manager",
    "notes",
  ];

  const exactFields = ["status"];

  const whereFilter = {
    company_id: companyId,
  };

  for (const key in filters) {
    const value = filters[key];

    if (value !== undefined && value !== null && value !== "") {
      if (stringFields.includes(key)) {
        whereFilter[key] = { [Op.iLike]: `%${value}%` };
      } else if (exactFields.includes(key)) {
        whereFilter[key] = value;
      }
    }
  }

  const advertisers = await Advertiser.findAll({
    where: whereFilter,
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "admin_email"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return advertisers;
};

exports.getAdvertiserById = async (req) => {
  const { id } = req.params;
  const advertiser = await Advertiser.findByPk(id);
  if (!advertiser) throw new Error("Advertiser not found");
  return advertiser;
};

exports.updateAdvertiser = async (req) => {
  const { id } = req.params;
  const advertiser = await Advertiser.findByPk(id);

  if (!advertiser) throw new Error("Advertiser not found");

  await advertiser.update(req.body);
  return "Advertiser update successfully";
};

exports.deleteAdvertiser = async (req) => {
  const { id } = req.params;
  const advertiser = await Advertiser.findByPk(id);

  if (!advertiser) throw new Error("Advertiser not found");

  await advertiser.destroy();
  return "Advertiser deleted successfully";
};

exports.changeAdvertiserStatus = async (req) => {
  const { id } = req.params;
  const { status } = req.body;

  if (
    !["Active", "Inactive", "Pending", "Rejected", "Banned"].includes(status)
  ) {
    const error = new Error("Invalid status value");
    error.statusCode = 400;
    throw error;
  }

  const advertiser = await Advertiser.findByPk(id);
  if (!advertiser) throw new Error("Advertiser not found");

  advertiser.status = status;
  await advertiser.save();

  return `Advertiser status updated to ${status}`;
};
