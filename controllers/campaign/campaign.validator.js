const Joi = require("joi");

const createCampaignValidator = Joi.object({
  companyId: Joi.string()
    .required()
    .messages({ "any.required": "Company ID is required" }),
  objective: Joi.string()
    .valid(
      "conversions",
      "sale",
      "app_installs",
      "leads",
      "impressions",
      "clicks"
    )
    .required()
    .messages({
      "any.only": "Invalid objective value",
      "any.required": "Objective is required",
    }),
  title: Joi.string().trim().min(1).max(255).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title is required",
    "string.max": "Title must be less than 255 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().max(5000).optional().messages({
    "string.max": "Description must be less than 5000 characters",
  }),
  defaultCampaignUrl: Joi.string().uri().required().messages({
    "string.uri": "Default campaign URL must be a valid URL",
    "any.required": "Default campaign URL is required",
  }),
  previewUrl: Joi.string()
    .uri()
    .optional()
    .messages({ "string.uri": "Preview URL must be a valid URL" }),
  timezone: Joi.string()
    .pattern(/^GMT[+-]\d{2}:\d{2}$/)
    .optional()
    .messages({
      "string.pattern.base": "Timezone must be in GMT+XX:XX format",
    }),
  startHour: Joi.number().integer().min(0).max(23).optional().messages({
    "number.base": "Start hour must be a number",
    "number.integer": "Start hour must be an integer",
    "number.min": "Start hour must be between 0 and 23",
    "number.max": "Start hour must be between 0 and 23",
  }),
  endHour: Joi.number().integer().min(0).max(23).optional().messages({
    "number.base": "End hour must be a number",
    "number.integer": "End hour must be an integer",
    "number.min": "End hour must be between 0 and 23",
    "number.max": "End hour must be between 0 and 23",
  }),
  activeDays: Joi.string()
    .optional()
    .messages({ "string.base": "Active days must be a string" }),
  uniqueClickSessionDuration: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      "number.base": "Unique click session duration must be a number",
      "number.integer": "Unique click session duration must be an integer",
      "number.min": "Unique click session duration must be a positive integer",
    }),
  duplicateClickAction: Joi.string()
    .valid("blank_page", "redirect_to_url", "show_message")
    .optional()
    .messages({ "any.only": "Invalid duplicate click action" }),
  campaignStartDate: Joi.string().isoDate().optional().messages({
    "string.isoDate": "Campaign start date must be valid ISO date",
  }),
  campaignEndDate: Joi.string()
    .isoDate()
    .optional()
    .messages({ "string.isoDate": "Campaign end date must be valid ISO date" }),
  campaignStatus: Joi.string()
    .valid("active", "paused", "expired")
    .optional()
    .messages({ "any.only": "Invalid campaign status" }),
  statusToBeSet: Joi.string()
    .valid("active", "paused")
    .optional()
    .messages({ "any.only": "Invalid status to be set" }),
  scheduleDate: Joi.string()
    .isoDate()
    .optional()
    .messages({ "string.isoDate": "Schedule date must be valid ISO date" }),
  publisherNotifyTime: Joi.string().isoDate().optional().messages({
    "string.isoDate": "Publisher notify time must be valid ISO date",
  }),
  conversionFlowLanguages: Joi.string()
    .optional()
    .messages({ "string.base": "Conversion flow languages must be a string" }),
  unsubscribeUrl: Joi.string()
    .uri()
    .optional()
    .messages({ "string.uri": "Unsubscribe URL must be a valid URL" }),
  suppressionUrl: Joi.string()
    .uri()
    .optional()
    .messages({ "string.uri": "Suppression URL must be a valid URL" }),
  conversionHoldPeriod: Joi.number().integer().min(0).optional().messages({
    "number.base": "Conversion hold period must be a number",
    "number.integer": "Conversion hold period must be an integer",
    "number.min": "Conversion hold period must be non-negitive integer",
  }),
  conversionStatusAfterHold: Joi.string()
    .valid("approved", "rejected", "pending")
    .optional()
    .messages({ "any.only": "Invalid conversion status after hold" }),
  revenueModel: Joi.string()
    .valid("fixed", "revshare", "hybrid")
    .optional()
    .messages({ "any.only": "Invalid revenue model" }),
  currency: Joi.string()
    .length(3)
    .optional()
    .messages({ "string.length": "Currency must be 3 character code" }),
  revenue: Joi.number()
    .precision(2)
    .optional()
    .messages({ "number.base": "Revenue must be a valid decimal number" }),
  payout: Joi.number()
    .precision(2)
    .optional()
    .messages({ "number.base": "Payout must be a valid decimal number" }),
  geoCoverage: Joi.string()
    .optional()
    .messages({ "string.base": "Geo coverage must be a string" }),
  category: Joi.string()
    .optional()
    .messages({ "string.base": "Category must be a string" }),
  devices: Joi.string()
    .optional()
    .messages({ "string.base": "Devices must be a string" }),
  operatingSystem: Joi.string()
    .optional()
    .messages({ "string.base": "Operating system must be a string" }),
  carrierTargeting: Joi.string()
    .optional()
    .messages({ "string.base": "Carrier targeting must be a string" }),
  allowedTrafficChannels: Joi.string()
    .optional()
    .messages({ "string.base": "Allowed traffic channels must be a string" }),
  conversionTracking: Joi.string()
    .valid("server_postback", "web_sdk", "iframe_pixel", "image_pixel")
    .optional()
    .messages({ "any.only": "Invalid conversion tracking method" }),
  status: Joi.string()
    .valid("active", "pending", "paused")
    .optional()
    .messages({ "any.only": "Invalid status" }),
  redirectType: Joi.string()
    .valid("301", "302")
    .optional()
    .messages({ "any.only": "Redirect type must be 301 or 302" }),
  visibility: Joi.string()
    .valid("public", "private", "ask_permission")
    .optional()
    .messages({ "any.only": "Invalid visibility setting" }),
});

// Update, Get, Get List, UpdateStatus remain the same
const updateCampaignValidator = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Campaign ID must be a valid UUID",
    "any.required": "Campaign ID is required",
  }),
  ...Object.fromEntries(
    Object.entries(createCampaignValidator.describe().keys).map(
      ([key, value]) => [
        key,
        value.flags && value.flags.presence === "required"
          ? createCampaignValidator.extract(key).optional()
          : createCampaignValidator.extract(key),
      ]
    )
  ),
}).unknown(true);

const getCampaignValidator = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Campaign ID must be a valid UUID",
    "any.required": "Campaign ID is required",
  }),
});

const getCampaignsValidator = Joi.object({
  page: Joi.number().integer().min(1).optional().messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be a positive integer",
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be between 1 and 100",
    "number.max": "Limit must be between 1 and 100",
  }),
  status: Joi.string()
    .valid("active", "pending", "paused")
    .optional()
    .messages({ "any.only": "Invalid status filter" }),
  objective: Joi.string()
    .valid(
      "conversions",
      "sale",
      "app_installs",
      "leads",
      "impressions",
      "clicks"
    )
    .optional()
    .messages({ "any.only": "Invalid objective filter" }),
  companyId: Joi.string()
    .guid({ version: "uuidv4" })
    .optional()
    .messages({ "string.guid": "Company ID must be valid UUID" }),
});

const updateStatusValidator = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Campaign ID must be a valid UUID",
    "any.required": "Campaign ID is required",
  }),
  status: Joi.string()
    .valid("active", "paused", "expired")
    .required()
    .messages({
      "any.only": "Invalid status value",
      "any.required": "Status is required",
    }),
});

module.exports = {
  createCampaignValidator,
  updateCampaignValidator,
  getCampaignValidator,
  getCampaignsValidator,
  updateStatusValidator,
};
