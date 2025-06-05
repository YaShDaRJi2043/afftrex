const { Op } = require("sequelize");
const moment = require("moment");

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
  const {
    name,
    admin_email,
    subdomain,
    subscription_type = "free",
    amount = 0,
  } = req.body;

  const file = req.file;

  if (subscription_type === "free") {
    const existingFree = await Company.findOne({
      where: {
        admin_email,
        subscription_type: "free",
      },
    });

    if (existingFree) {
      throw new Error("Free subscription is already used with this email.");
    }
  }

  const logoFileName = file
    ? await uploadToS3(file.buffer, file.originalname)
    : null;

  const company = await Company.create({
    name,
    admin_email,
    subdomain,
    logo: logoFileName,
    subscription_type,
    amount: subscription_type === "paid" ? parseFloat(amount) : 0,
  });

  return company;
};

//for super-admin
exports.approve = async (req) => {
  const { id } = req.params;
  const { subscription_days = 30, amount = 0 } = req.body;

  const company = await Company.findByPk(id);
  if (!company) throw new Error("Company not found");

  company.status = "approved";
  company.subscription_days = subscription_days;
  company.subscription_start_date = new Date();
  company.amount = amount;
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

exports.reject = async (companyId) => {
  const company = await Company.findOne({
    where: {
      id: companyId.params.id,
    },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  company.status = "rejected";
  await company.save();

  const emailSubject = { app_name: "Afftrex" };
  const emailData = {
    app_name: "Afftrex",
    company_name: company.name,
  };

  await mailer.sendMail(
    company.admin_email,
    "company-rejection",
    emailSubject,
    emailData
  );

  return { message: "Company has been rejected and notified." };
};

exports.list = async (req, res) => {
  const {
    search = "",
    status,
    subscription_type,
    // page = 1,
    // limit = 10,
    sort_by = "created_at",
    order = "DESC",
  } = req.query;

  const where = {};

  if (status) {
    where.status = status.toLowerCase();
  }

  if (subscription_type) {
    where.subscription_type = subscription_type.toLowerCase();
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { admin_email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // const result = await Company.paginate({
  //   page: parseInt(page),
  //   paginate: parseInt(limit),
  //   where,
  //   order: [[sort_by, order.toUpperCase()]],
  // });

  // Fetch all without pagination for testing
  const result = await Company.findAll({
    where,
    order: [[sort_by, order.toUpperCase()]],
  });

  const formatted = result.map((company) => {
    const data = {
      id: company.id,
      name: company.name,
      admin_email: company.admin_email,
      subdomain: company.subdomain,
      logo: company.logo,
      status: company.status,
      subscription_type: company.subscription_type,
      created_at: company.created_at,
      updated_at: company.updated_at,
    };

    if (company.status === "approved") {
      const startDate = new Date(company.subscription_start_date);
      const now = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + company.subscription_days);

      const remainingDays = Math.max(
        0,
        Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
      );

      data.subscription_days = company.subscription_days;
      data.subscription_start_date = company.subscription_start_date;
      data.subscription_remain_day = remainingDays;
      data.amount = company.amount;
    }

    return data;
  });

  // Return all results (no pagination)
  return {
    data: formatted,
    total: formatted.length,
  };
};

exports.extendSubscription = async (req, res) => {
  const companyId = req.params.id;
  const { subscription_days, amount } = req.body;

  if (
    !subscription_days ||
    !amount ||
    isNaN(subscription_days) ||
    isNaN(amount)
  ) {
    throw new Error("Both days and amount must be valid numbers.");
  }

  const company = await Company.findByPk(companyId);
  if (!company) {
    throw new Error("Company not found");
  }

  // Update values
  company.subscription_days += parseInt(subscription_days);
  company.amount += parseFloat(amount);
  company.updated_at = new Date();

  await company.save();

  const subscriptionStart = company.subscription_start_date || new Date();
  const newExpiryDate = moment(subscriptionStart)
    .add(company.subscription_days, "days")
    .format("MMMM Do YYYY");

  const emailSubject = { app_name: "Afftrex" };

  const emailData = {
    app_name: "Afftrex",
    user_name: `${company.name} Admin`,
    subscription_type: company.subscription_type,
    new_expiry_date: newExpiryDate,
    extension_period: `${subscription_days} days`,
    dashboard_url: `${serverInfo.api_url}/login/${company.subdomain}`,
  };

  await mailer.sendMail(
    company.admin_email,
    "subscription-extension",
    emailSubject,
    emailData
  );

  return {
    id: company.id,
    name: company.name,
    subscription_days: company.subscription_days,
    amount: company.amount,
  };
};

exports.sendSubscriptionReminder = async (req, res) => {
  const { id } = req.params;
  const company = await Company.findByPk(id);
  if (!company) {
    throw new Error("Company not found");
  }

  if (company.status !== "approved") {
    throw new Error("Only approved companies can receive reminder emails.");
  }

  const subscriptionStart = company.subscription_start_date || new Date();
  const expiryDate = moment(subscriptionStart).add(
    company.subscription_days,
    "days"
  );
  const today = moment();
  const days_remaining = expiryDate.diff(today, "days");

  if (days_remaining <= 0) {
    throw new Error("The subscription has already expired.");
  }

  // const emailSubject = `⚠️ Your ${app_name} Subscription Expires in ${days_remaining} Days`;
  const emailSubject = {
    app_name: "Afftrex",
    days_remaining: days_remaining,
  };

  const emailData = {
    app_name: "Afftrex",
    user_name: `${company.name} Admin`,
    days_remaining: days_remaining,
    subscription_type: company.subscription_type,
    expiry_date: expiryDate.format("MMMM Do YYYY"),
    support_email: "support@afftrex.com",
  };

  await mailer.sendMail(
    company.admin_email,
    "subscription-expiration-warning",
    emailSubject,
    emailData
  );

  return `Reminder email sent successfully to ${company.admin_email}`;
};
