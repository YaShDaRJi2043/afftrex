// services/campaignService.js
const { Op } = require("sequelize");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");
const { generateSecurityToken } = require("@helper/campaignHelpers");

const {
  Campaign,
  Company,
  CampaignAssignment,
  Advertiser,
} = require("@models/index");
const CampaignHelpers = require("@helper/campaignHelpers");
const { uploadToS3 } = require("@utils/s3");
const { serverInfo } = require("@config/config");

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
    title,
    advertiser_id, // Add advertiser_id from the request body
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

  const company_id = req.user.company_id;
  const file = req.file;

  const company = await Company.findOne({ where: { id: company_id } });
  if (!company) throw new Error("Company not found");

  // Validate advertiser_id
  if (!advertiser_id) throw new Error("Advertiser ID is required");

  const baseSlug = slugify(title, { lower: true, strict: true });
  const trackingSlug = await this.generateUniqueSlug(baseSlug);

  const thumbnailKey = file
    ? await uploadToS3(file.buffer, file.originalname, "thumbnails")
    : null;

  const newCampaignData = {
    ...restOfData,
    unique_id: uuidv4(), // Generate unique_id
    company_id,
    advertiser_id, // Include advertiser_id in the new campaign data
    title,
    trackingSlug,
    trackingScript: "", // placeholder
    thumbnail: thumbnailKey,
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
    conversionTracking: conversionTracking || "iframe_pixel",
    status: status || "active",
    redirectType: redirectType || "302",
    visibility: visibility || "public",
  };

  const campaign = await Campaign.create(newCampaignData);

  // ✅ Generate and update tracking script with encrypted unique_id
  const trackingScript = await exports.generateTrackingScript({
    conversionTracking: conversionTracking || "iframe_pixel",
    trackingSlug,
    uniqueId: campaign.unique_id, // Use unique_id instead of id
    campaignId: campaign.id, // Pass campaign ID
    scheduleDate: scheduleDate || null, // Pass scheduleDate if available
  });

  await campaign.update({ trackingScript });

  const createdCampaign = await Campaign.findByPk(campaign.id, {
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "admin_email"],
      },
    ],
  });

  if (enableScheduleStatusChange && scheduleDate && statusToBeSet) {
    await CampaignHelpers.updateScheduledCampaignStatuses(
      campaign.id,
      statusToBeSet,
      scheduleDate
    );
  }

  return createdCampaign;
};

exports.getCampaigns = async (req) => {
  const filters = req.body;
  const role = req.user.role;
  const { id: userId, company } = req.user;

  const stringFields = [
    "title",
    "description",
    "defaultLandingPageName",
    "appName",
    "appId",
    "erid",
    "note",
    "termsAndConditions",
    "primaryTrackingDomain",
    "externalOfferId",
    "trackingDomain",
    "trackingSlug",
  ];

  const exactFields = [
    "objective",
    "campaignStatus",
    "enableScheduleStatusChange",
    "statusToBeSet",
    "enableTimeTargeting",
    "enableInactiveHours",
    "enableDuplicateClickAction",
    "enableCampaignSchedule",
    "enablePublisherEmailNotify",
    "conversionStatusAfterHold",
    "revenueModel",
    "currency",
    "requireTermsAcceptance",
    "conversionTracking",
    "status",
    "redirectType",
    "visibility",
  ];

  const whereFilter = {};
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

  // Role-based filtering
  if (role === "publisher") {
    const publicOrAskFilter = {
      company_id: company.id,
      visibility: { [Op.in]: ["public", "ask_permission"] },
    };

    console.log("publicOrAskFilter", publicOrAskFilter);

    // Find campaigns assigned to this publisher
    const assignedCampaigns = await CampaignAssignment.findAll({
      where: { publisher_id: userId },
      attributes: ["campaignId"],
    });

    const assignedCampaignIds = assignedCampaigns.map((a) => a.campaignId);
    console.log("publicOrAskFilter", assignedCampaignIds);

    whereFilter[Op.or] = [
      publicOrAskFilter,
      {
        id: { [Op.in]: assignedCampaignIds },
        visibility: "private",
        company_id: company.id,
      },
    ];
  } else if (role === "advertiser") {
    whereFilter.advertiser_id = userId; // Filter campaigns by advertiser_id
  } else {
    // Admin or internal user: filter by company
    whereFilter.company_id = company.id;
  }

  const campaigns = await Campaign.findAll({
    where: whereFilter,
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "admin_email"],
        required: true,
      },
      {
        model: Advertiser,
        as: "advertiser",
        attributes: ["id", "name"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  if (role === "publisher") {
    for (const campaign of campaigns) {
      if (campaign.hidePayoutForPublisher) {
        campaign.payout = undefined;
      }
    }
  }

  return campaigns;
};

exports.getCampaignById = async (req, id) => {
  const role = req.user.role.name;

  const { id: userId, company } = req.user;

  const campaign = await Campaign.findByPk(id, {
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "admin_email"],
      },
      {
        model: Advertiser,
        as: "advertiser",
        attributes: ["id", "name"],
      },
    ],
  });

  if (!campaign) return null;

  if (role === "publisher") {
    const isSameCompany = campaign.company_id === company.id;

    if (!isSameCompany) return null;

    if (campaign.visibility === "private") {
      // Only allow if assigned
      const isAssigned = await CampaignAssignment.findOne({
        where: { campaignId: campaign.id, publisherId: userId },
      });

      if (!isAssigned) return null;
    }

    if (
      campaign.visibility === "public" ||
      campaign.visibility === "ask_permission"
    ) {
      // ✅ Allowed — continue
    }
  } else if (role === "advertiser") {
    if (campaign.advertiser_id !== userId) return null; // Restrict access to campaigns not owned by the advertiser
  }

  return campaign;
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

  // ✅ If conversionTracking is being updated, regenerate trackingScript
  if (
    updates.conversionTracking &&
    updates.conversionTracking !== campaign.conversionTracking
  ) {
    const newTrackingScript = await exports.generateTrackingScript({
      conversionTracking: updates.conversionTracking,
      trackingSlug: updates.trackingSlug || campaign.trackingSlug,
      uniqueId: campaign.unique_id,
      campaignId: campaign.id,
      scheduleDate: updates.scheduleDate || campaign.scheduleDate,
    });

    updates.trackingScript = newTrackingScript;
  }

  await campaign.update(updates);

  return await Campaign.findByPk(id, {
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "admin_email"],
      },
      {
        model: Advertiser,
        as: "advertiser",
        attributes: ["id", "name"],
      },
    ],
  });
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

exports.generateTrackingScript = async ({
  conversionTracking,
  trackingSlug,
  uniqueId,
  campaignId,
  scheduleDate,
}) => {
  if (!conversionTracking || !trackingSlug || !uniqueId) {
    throw new Error("Missing required parameters for script generation.");
  }

  let script = "";

  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  const company = await Company.findByPk(campaign.company_id);
  if (!company) {
    throw new Error("Company not found");
  }

  switch (conversionTracking) {
    case "server_postback": {
      // Generate security token
      const securityToken = generateSecurityToken(campaignId, scheduleDate);

      // Store the security token in the database
      await campaign.update({ security_token: securityToken });

      script = `
https://${company.subdomain}.afftrex.org/postback/${trackingSlug}?click_id=REPLACE_CLICK_ID_VAR&event_type=conversion&campaign_id=${uniqueId}&transaction_id=REPLACE_TRANSACTION_ID_VAR&saleAmount=REPLACE_SALE_AMOUNT_VAR&currency=REPLACE_CURRENCY_VAR&conversionStatus=REPLACE_ORDER_STATUS_VAR&security_token=${securityToken}
`.trim();
      break;
    }

    case "iframe_pixel":
    case "image_pixel":
      script = `
<iframe 
  src="https://${company.subdomain}.afftrex.org/pixel/${trackingSlug}?event_type=click&campaign_id=${uniqueId}&transaction_id=REPLACE_TRANSACTION_ID_VAR&saleAmount=REPLACE_SALE_AMOUNT_VAR&currency=REPLACE_CURRENCY_VAR&conversionStatus=REPLACE_ORDER_STATUS_VAR" 
  width="1" 
  height="1" 
  frameborder="0" 
  scrolling="no">
</iframe>
      `.trim();
      break;

    default:
      throw new Error("Invalid conversion tracking type.");
  }

  return script;
};

exports.updateCampaignSettings = async (id, updates) => {
  const campaign = await Campaign.findByPk(id);
  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    throw error;
  }

  // Only allow updates for specific fields
  const allowedUpdates = {};

  if (updates.hasOwnProperty("hidePayoutForPublisher")) {
    allowedUpdates.hidePayoutForPublisher = updates.hidePayoutForPublisher;
  }

  if (updates.hasOwnProperty("redirectType")) {
    allowedUpdates.redirectType = updates.redirectType;
  }

  if (Object.keys(allowedUpdates).length === 0) {
    const error = new Error("No valid fields provided for update");
    error.statusCode = 400;
    throw error;
  }

  return await campaign.update(allowedUpdates);
};

exports.updateFallbackFields = async (id, updates) => {
  const campaign = await Campaign.findByPk(id);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (updates.fallbackCampaignId) {
    const fallbackCampaign = await Campaign.findByPk(
      updates.fallbackCampaignId
    );
    if (!fallbackCampaign) {
      throw new Error("Fallback campaign not found");
    }
    updates.defaultCampaignUrl = fallbackCampaign.defaultCampaignUrl;
  }

  if (updates.fallbackUrl) {
    updates.defaultCampaignUrl = updates.fallbackUrl;
  }

  await campaign.update(updates);
  return campaign;
};
