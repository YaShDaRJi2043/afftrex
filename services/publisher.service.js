const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const { Publisher, Company } = require("@models");
const { generatePassword } = require("@utils/password");
const mailer = require("@utils/mail");
const { serverInfo } = require("@config/config");

exports.createPublisher = async (req) => {
  const {
    name,
    username,
    email,
    password,
    notify = false,
    phone = null,
    status = "Active",
    country,
    city,
    state,
    zip_code,
    entity_type,
    im_type,
    im_username,
    promotion_method,
    reference_id,
    tax_id,
    referred_by,
    managers,
    currency,
    tags,
    companyName,
    companyAddress,
  } = req.body;

  const companyId = req.user.company_id;

  const signup_ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    null;

  const Password = password || generatePassword();

  const publisher = await Publisher.create({
    name,
    username,
    email,
    password: Password,
    notify,
    phone,
    status,
    country,
    city,
    state,
    zip_code,
    entity_type,
    im_type,
    im_username,
    promotion_method,
    reference_id,
    tax_id,
    referred_by,
    managers,
    signup_ip,
    currency,
    tags,
    companyName,
    companyAddress,
    company_id: companyId,
  });

  if (notify) {
    const company = await Company.findByPk(companyId);
    if (!company) throw new Error("Company not found");

    const adminName = req.user.name;
    const adminRole = req.user.role?.name || "Admin";

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
      employee_role: "Publisher",
      login_url: `${serverInfo.api_url}/login/${company.subdomain}`,
      admin_name: adminName,
      admin_role: adminRole,
    };

    await mailer.sendMail(email, "employee-welcome", emailSubject, emailData);
  }

  return publisher;
};

exports.getAllPublishers = async (req) => {
  const filters = req.body;
  const companyId = req.user.company.id;

  const stringFields = [
    "name",
    "username",
    "email",
    "phone",
    "country",
    "city",
    "zip_code",
    "state",
    "entity_type",
    "im_type",
    "im_username",
    "promotion_method",
    "reference_id",
    "tax_id",
    "referred_by",
    "signup_ip",
    "currency",
    "companyName",
    "companyAddress",
    "tags",
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

  const publishers = await Publisher.findAll({
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

  return publishers;
};

exports.getPublisherById = async (req) => {
  const { id } = req.params;
  const publisher = await Publisher.findOne({
    where: {
      id,
      company_id: req.user.company_id,
    },
  });

  if (!publisher) throw new Error("Publisher not found");
  return publisher;
};

exports.updatePublisher = async (req) => {
  const { id } = req.params;

  const publisher = await Publisher.findOne({
    where: {
      id,
      company_id: req.user.company_id,
    },
  });

  if (!publisher) throw new Error("Publisher not found");

  await publisher.update(req.body);
  return "Updated successfully";
};

exports.deletePublisher = async (req) => {
  const { id } = req.params;

  const publisher = await Publisher.findOne({
    where: {
      id,
      company_id: req.user.company_id,
    },
  });

  if (!publisher) throw new Error("Publisher not found");

  await publisher.destroy();
  return "Deleted successfully";
};

exports.changePublisherStatus = async (req) => {
  const { id } = req.params;
  const { status } = req.body;

  if (
    !["Active", "Pending", "Disabled", "Rejected", "Banned"].includes(status)
  ) {
    const error = new Error("Invalid status value");
    error.statusCode = 400;
    throw error;
  }

  const publisher = await Publisher.findOne({
    where: {
      id,
      company_id: req.user.company_id,
    },
  });

  if (!publisher) throw new Error("Publisher not found");

  publisher.status = status;
  await publisher.save();

  return `Publisher status updated to ${status}`;
};
