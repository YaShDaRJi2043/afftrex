// services/campaignService.js
const { Op } = require("sequelize");
const slugify = require("slugify");

const { Campaign, Company, CampaignAssignment } = require("@models/index");
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

  // Check company
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

  // Generate unique slug
  const baseSlug = slugify(title, { lower: true, strict: true });
  const trackingSlug = await this.generateUniqueSlug(baseSlug);

  // Generate tracking script
  const trackingScript = await this.generateTrackingScript({
    conversionTracking,
    trackingSlug,
  });

  // Validate dates
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

  // Upload thumbnail if exists
  const thumbnailKey = file
    ? await uploadToS3(file.buffer, file.originalname, "thumbnails")
    : null;

  // Create campaign
  const newCampaignData = {
    ...restOfData,
    company_id,
    title,
    trackingSlug,
    trackingScript, // Store the generated script
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
    conversionTracking: conversionTracking || "server_postback",
    status: status || "active",
    redirectType: redirectType || "302",
    visibility: visibility || "public",
  };

  const campaign = await Campaign.create(newCampaignData);

  // Include company details in response
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

  return CampaignHelpers.formatCampaignResponse(createdCampaign);
};

exports.getCampaigns = async (req) => {
  const filters = req.body;
  const role = req.user.role.name;
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
    ],
    order: [["created_at", "DESC"]],
  });

  return campaigns.map(CampaignHelpers.formatCampaignResponse);
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
  }

  return CampaignHelpers.formatCampaignResponse(campaign);
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
        attributes: ["id", "name", "admin_email"],
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

exports.generateTrackingScript = async (campaignId) => {
  // Fetch the campaign details
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  const { conversionTracking, trackingSlug } = campaign;

  // Generate script based on conversionTracking type
  switch (conversionTracking) {
    case "server_postback":
      return `
        <script>
          fetch('${serverInfo.api_url}/track/${trackingSlug}', {
            method: 'POST',
            body: JSON.stringify({ event: 'conversion', userId: 'USER_ID' }),
            headers: { 'Content-Type': 'application/json' }
          });
        </script>
      `;
    case "web_sdk":
      return `
        <script src="${serverInfo.api_url}/sdk.js"></script>
        <script>
          const sdk = new YourSDK();
          sdk.trackConversion({ campaignSlug: '${trackingSlug}', userId: 'USER_ID' });
        </script>
      `;
    case "iframe_pixel":
      return `
        <iframe src="${serverInfo.api_url}/pixel/${trackingSlug}" width="1" height="1" style="display:none;"></iframe>
      `;
    case "image_pixel":
      return `
        <img src="${serverInfo.api_url}/pixel/${trackingSlug}" width="1" height="1" style="display:none;" />
      `;
    default:
      throw new Error("Invalid conversion tracking type");
  }
};
