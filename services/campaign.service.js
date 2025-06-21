// services/campaignService.js
const { Campaign, Company } = require("@models/index");
const { Op } = require("sequelize");
const slugify = require("slugify");
const CampaignHelpers = require("@root/helper/campaignHelpers");
const { uploadToS3 } = require("@root/utils/s3");

exports.generateUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let counter = 1;

  while (await Campaign.findOne({ where: { trackingSlug: slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

exports.createCampaign = async (req) => {
  const {
    company_id,
    title,
    enableCampaignSchedule,
    campaignStartDate,
    campaignEndDate,
    enableTimeTargeting,
    startHour,
    endHour,
    defaultLandingPageName,
    timezone,
    enableInactiveHours,
    activeDays,
    uniqueClickSessionDuration,
    enableDuplicateClickAction,
    duplicateClickAction,
    campaignStatus,
    enableScheduleStatusChange,
    statusToBeSet,
    scheduleDate,
    enablePublisherEmailNotify,
    publisherNotifyTime,
    conversionFlowLanguages,
    enableDeepLink,
    conversionStatusAfterHold,
    revenueModel,
    currency,
    revenue,
    payout,
    geoCoverage,
    category,
    devices,
    operatingSystem,
    carrierTargeting,
    allowedTrafficChannels,
    requireTermsAcceptance,
    conversionTracking,
    status,
    redirectType,
    visibility,
    thumbnail,
    ...restOfData
  } = req.body;

  const file = req.file;

  // 1. Check company
  const company = await Company.findOne({
    where: {
      id: company_id,
    },
  });
  if (!company) {
    const error = new Error("Company not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Generate unique slug
  const baseSlug = slugify(title, { lower: true, strict: true });
  const trackingSlug = await this.generateUniqueSlug(baseSlug);

  // 3. Validate dates
  if (enableCampaignSchedule && campaignStartDate && campaignEndDate) {
    if (new Date(campaignStartDate) >= new Date(campaignEndDate)) {
      const error = new Error("Campaign end date must be after start date");
      error.statusCode = 400;
      throw error;
    }
  }

  if (enableTimeTargeting && startHour >= endHour) {
    const error = new Error("End hour must be after start hour");
    error.statusCode = 400;
    throw error;
  }

  // 4. Upload thumbnail if exists
  const thumbnailKey = file
    ? await uploadToS3(file.buffer, file.originalname, "thumbnails")
    : null;

  // 5. Create campaign
  const newCampaignData = {
    ...restOfData,
    company_id,
    title,
    trackingSlug,
    thumbnail: thumbnailKey,
    // thumbnail,
    defaultLandingPageName: defaultLandingPageName || "Default",
    enableTimeTargeting: enableTimeTargeting || false,
    timezone: timezone || "GMT+05:30",
    startHour: startHour || 0,
    endHour: endHour || 0,
    enableInactiveHours: enableInactiveHours || false,
    activeDays: activeDays || [],
    uniqueClickSessionDuration: uniqueClickSessionDuration || 24,
    enableDuplicateClickAction: enableDuplicateClickAction || false,
    duplicateClickAction: duplicateClickAction || "blank_page",
    enableCampaignSchedule: enableCampaignSchedule || false,
    campaignStartDate,
    campaignEndDate,
    campaignStatus: campaignStatus || "active",
    enableScheduleStatusChange: enableScheduleStatusChange || false,
    statusToBeSet: statusToBeSet || "active",
    scheduleDate,
    enablePublisherEmailNotify: enablePublisherEmailNotify || false,
    publisherNotifyTime,
    conversionFlowLanguages: conversionFlowLanguages || [],
    enableDeepLink: enableDeepLink || false,
    conversionStatusAfterHold: conversionStatusAfterHold || "approved",
    revenueModel: revenueModel || "fixed",
    currency: currency || "INR",
    revenue: revenue || 0,
    payout: payout || 0,
    geoCoverage: geoCoverage || [],
    category: category || [],
    devices: devices || [],
    operatingSystem: operatingSystem || [],
    carrierTargeting: carrierTargeting || [],
    allowedTrafficChannels: allowedTrafficChannels || [],
    requireTermsAcceptance: requireTermsAcceptance || false,
    conversionTracking: conversionTracking || "server_postback",
    status: status || "active",
    redirectType: redirectType || "302",
    visibility: visibility || "public",
  };

  const campaign = await Campaign.create(newCampaignData);

  // 6. Include company details in response
  const createdCampaign = await Campaign.findByPk(campaign.id, {
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "admin_email"],
      },
    ],
  });

  return CampaignHelpers.formatCampaignResponse(createdCampaign);
};

exports.getCampaigns = async (req) => {
  const filters = req.body; // direct destructure of request body
  const companyName = req.user?.company?.name;
  console.log(companyName);

  const whereFilter = {};

  // Build dynamic where clause
  for (const key in filters) {
    if (filters[key]) {
      whereFilter[key] = { [Op.iLike]: `%${filters[key]}%` };
    }
  }

  const campaigns = await Campaign.findAll({
    whereFilter,
    include: [
      {
        model: Company,
        as: "company",
        where: { name: companyName },
        attributes: ["id", "name", "admin_email"],
        required: true,
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return campaigns.map(CampaignHelpers.formatCampaignResponse);
};

exports.getCampaignById = async (id) => {
  const campaign = await Campaign.findByPk(id, {
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "email"],
      },
    ],
  });
  return campaign ? CampaignHelpers.formatCampaignResponse(campaign) : null;
};

exports.updateCampaign = async (id, updates) => {
  const campaign = await Campaign.findByPk(id);
  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  // If title is being updated, generate new tracking slug
  if (updates.title && updates.title !== campaign.title) {
    const baseSlug = slugify(updates.title, { lower: true, strict: true });
    updates.trackingSlug = await this.generateUniqueSlug(baseSlug);
  }

  // Validate date ranges if provided
  if (
    updates.enableCampaignSchedule !== undefined &&
    (updates.campaignStartDate || campaign.campaignStartDate) &&
    (updates.campaignEndDate || campaign.campaignEndDate)
  ) {
    const startDate = updates.campaignStartDate || campaign.campaignStartDate;
    const endDate = updates.campaignEndDate || campaign.campaignEndDate;
    if (new Date(startDate) >= new Date(endDate)) {
      const error = new Error("Campaign end date must be after start date");
      error.statusCode = 400;
      throw error;
    }
  }

  // Validate time targeting if provided
  if (
    updates.enableTimeTargeting !== undefined &&
    (updates.startHour !== undefined || campaign.startHour !== undefined) &&
    (updates.endHour !== undefined || campaign.endHour !== undefined)
  ) {
    const startHour =
      updates.startHour !== undefined ? updates.startHour : campaign.startHour;
    const endHour =
      updates.endHour !== undefined ? updates.endHour : campaign.endHour;
    if (startHour >= endHour) {
      const error = new Error("End hour must be after start hour");
      error.statusCode = 400;
      throw error;
    }
  }

  await campaign.update(updates);

  const updatedCampaign = await Campaign.findByPk(id, {
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  return CampaignHelpers.formatCampaignResponse(updatedCampaign);
};

exports.deleteCampaign = async (id) => {
  const campaign = await Campaign.findByPk(id);
  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }
  await campaign.destroy();
};

exports.updateCampaignStatus = async (id, status) => {
  if (!["active", "paused", "expired"].includes(status)) {
    const error = new Error("Invalid status value");
    error.statusCode = 400;
    throw error;
  }

  const campaign = await Campaign.findByPk(id);
  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  await campaign.update({ campaignStatus: status });
  return { id, status };
};
