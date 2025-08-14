// services/campaignService.js
const { Op } = require("sequelize");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");

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

  const company = await Company.findOne({ where: { id: company_id } });
  if (!company) throw new Error("Company not found");

  const baseSlug = slugify(title, { lower: true, strict: true });
  const trackingSlug = await this.generateUniqueSlug(baseSlug);

  const thumbnailKey = file
    ? await uploadToS3(file.buffer, file.originalname, "thumbnails")
    : null;

  const newCampaignData = {
    ...restOfData,
    unique_id: uuidv4(), // Generate unique_id
    company_id,
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

  return await Campaign.findAll({
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

  await campaign.update(updates);

  return await Campaign.findByPk(id, {
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "admin_email"],
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
}) => {
  if (!conversionTracking || !trackingSlug || !uniqueId) {
    throw new Error("Missing required parameters for script generation.");
  }

  let script = "";

  switch (conversionTracking) {
    case "server_postback":
      script = `
<script>
  fetch('${serverInfo.api_url}/track/${trackingSlug}', {
    method: 'POST',
    body: JSON.stringify({ event: 'conversion', userId: 'USER_ID' }),
    headers: { 'Content-Type': 'application/json' }
  });
</script>
      `.trim();
      break;

    case "web_sdk":
      script = `
<script src="${serverInfo.api_url}/sdk.js"></script>
<script>
  const sdk = new YourSDK(); // Replace with actual SDK logic
  sdk.trackConversion({
    campaignSlug: '${trackingSlug}',
    userId: 'USER_ID'
  });
</script>
      `.trim();
      break;

    case "iframe_pixel":
    case "image_pixel":
      script = `
<iframe 
  src="${serverInfo.api_url}/pixel/${trackingSlug}?event_type=click&campaign_id=${uniqueId}&transaction_id=REPLACE_TRANSACTION_ID_VAR&saleAmount=REPLACE_SALE_AMOUNT_VAR&currency=REPLACE_CURRENCY_VAR&conversionStatus=REPLACE_ORDER_STATUS_VAR" 
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

exports.updateTrackingScriptParams = async (campaignId, params) => {
  console.log(
    "Updating tracking script params for campaign:",
    campaignId,
    params
  );

  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) throw new Error("Campaign not found");

  const script = campaign.trackingScript;
  if (!script?.includes("<iframe"))
    throw new Error("No valid iframe script to update");

  let updatedScript = script;

  // Extract iframe src URL
  const srcMatch = updatedScript.match(/src="([^"]+)"/);
  if (!srcMatch) throw new Error("Invalid iframe src");

  let iframeSrc = srcMatch[1];

  // Convert query string to object
  const [baseUrl, queryStr] = iframeSrc.split("?");
  const queryParams = new URLSearchParams(queryStr || "");

  // Update/add query parameters
  const queryParamFields = [
    "transaction_id",
    "coupon",
    "order_id",
    "product_sku",
    "change_currency",
    "js_tag",
    "event_type",
    "amount",
  ];

  queryParamFields.forEach((key) => {
    if (params[key]) {
      queryParams.set(key, params[key]);
    }
  });

  // Rebuild iframe src
  iframeSrc = `${baseUrl}?${queryParams.toString()}`;
  updatedScript = updatedScript.replace(/src="[^"]+"/, `src="${iframeSrc}"`);

  // Update iframe attributes
  const updateAttr = (attr, value) => {
    if (!value) return;

    if (updatedScript.includes(`${attr}="`)) {
      updatedScript = updatedScript.replace(
        new RegExp(`${attr}="[^"]*"`, "g"),
        `${attr}="${value}"`
      );
    } else {
      updatedScript = updatedScript.replace(
        "<iframe",
        `<iframe ${attr}="${value}"`
      );
    }
  };

  updateAttr("width", params.width);
  updateAttr("height", params.height);
  updateAttr("frameborder", params.frameborder);
  updateAttr("scrolling", params.scrolling);

  campaign.trackingScript = updatedScript;
  await campaign.save();

  return campaign.trackingScript;
};
