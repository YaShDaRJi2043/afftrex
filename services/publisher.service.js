const { Op } = require("sequelize");

const {
  Publisher,
  Company,
  CampaignAssignment,
  Campaign,
  ApprovedCampaignPublisher,
} = require("@models");
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

  console.log(filters?.excludeApprovedForCampaign, filters?.campaign_id);

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

  if (filters?.excludeApprovedForCampaign && filters?.campaign_id) {
    const approvedEntry = await ApprovedCampaignPublisher.findOne({
      where: {
        campaign_id: filters.campaign_id,
      },
      attributes: ["publisher_id"],
    });

    const approvedPublisherIds = approvedEntry?.publisher_id || [];
    whereFilter.id = { [Op.notIn]: approvedPublisherIds };
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

exports.campaignsByPublisherId = async (req) => {
  const { id } = req.params;

  const publisher = await Publisher.findOne({
    where: {
      id,
      company_id: req.user.company_id,
    },
  });

  if (!publisher) throw new Error("Publisher not found");

  const campaigns = await CampaignAssignment.findAll({
    where: {
      publisher_id: id,
    },
    include: [
      {
        model: Campaign,
        as: "campaign",
        attributes: ["id", "title"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.campaign.title,
    publisherLink: campaign.publisherLink,
  }));
};

exports.approvePublishersForCampaign = async (req) => {
  const { campaignId, publisherIds } = req.body;

  const approvedEntry = await ApprovedCampaignPublisher.findOne({
    where: { campaign_id: campaignId },
  });

  if (approvedEntry) {
    const updatedPublisherIds = Array.from(
      new Set([...approvedEntry.publisher_id, ...publisherIds])
    );
    await approvedEntry.update({ publisher_id: updatedPublisherIds });
    return approvedEntry;
  } else {
    const newEntry = await ApprovedCampaignPublisher.create({
      campaign_id: campaignId,
      publisher_id: publisherIds,
    });
    return newEntry;
  }
};

exports.getApprovedPublishersForCampaign = async (req) => {
  const { campaignId } = req.params;

  const approvedEntry = await ApprovedCampaignPublisher.findOne({
    where: { campaign_id: campaignId },
    attributes: ["publisher_id"],
  });

  if (!approvedEntry || approvedEntry.publisher_id.length === 0) {
    return [];
  }

  const publishers = await Publisher.findAll({
    where: { id: { [Op.in]: approvedEntry.publisher_id } },
    attributes: ["id", "name", "email"],
  });

  return publishers;
};

exports.removePublisherFromApprovedList = async (req) => {
  const { campaignId, publisherIds } = req.body;

  const approvedEntry = await ApprovedCampaignPublisher.findOne({
    where: { campaign_id: campaignId },
  });

  const currentPublisherIds = approvedEntry.publisher_id || [];

  const updatedPublisherIds = currentPublisherIds.filter(
    (id) => !publisherIds.includes(id)
  );

  if (updatedPublisherIds.length === 0) {
    await approvedEntry.destroy();
  } else {
    await approvedEntry.update({ publisher_id: updatedPublisherIds });
  }

  return;
};
