const { Op } = require("sequelize");

const { Advertiser, Company } = require("@models/index");
const { generatePassword } = require("@utils/password");
const mailer = require("@utils/mail");
const { serverInfo } = require("@config/config");

exports.createAdvertiser = async (req) => {
  const {
    name,
    email,
    password,
    notify = false,
    status = "Active",
    reference_id = null,
    managers = null,
    notes = null,
    country = null,
    state = null,
    city = null,
    phone = null,
    currency = null,
    entity_type = null,
    website_url = null,
    tags = [],
    companyName = null,
  } = req.body;

  const companyId = req.user.company_id;

  const Password = password || generatePassword();

  const advertiser = await Advertiser.create({
    name,
    email,
    password: Password,
    status,
    reference_id,
    managers,
    notes,
    country,
    state,
    city,
    phone,
    currency,
    entity_type,
    website_url,
    tags,
    companyName,
    company_id: companyId,
  });

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
    "name",
    "email",
    "reference_id",
    "managers",
    "notes",
    "country",
    "state",
    "city",
    "phone",
    "currency",
    "entity_type",
    "website_url",
    "companyName",
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
