const Joi = require("joi");

const baseCampaignFields = {
  company_id: Joi.number().integer().positive().optional(),
  objective: Joi.string()
    .valid(
      "conversions",
      "sale",
      "app_installs",
      "leads",
      "impressions",
      "clicks"
    )
    .optional(),
  title: Joi.string().trim().max(255).optional(),
  description: Joi.string().max(5000).optional(),
  preview_url: Joi.string().uri().optional(),
  defaultCampaignUrl: Joi.string().uri().optional(),
  defaultLandingPageName: Joi.string().optional(),
  enableTimeTargeting: Joi.boolean().optional(),
  timezone: Joi.string().optional(),
  startHour: Joi.number().integer().min(0).max(23).optional(),
  endHour: Joi.number().integer().min(0).max(23).optional(),
  enableInactiveHours: Joi.boolean().optional(),
  activeDays: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),
  uniqueClickSessionDuration: Joi.number().integer().min(0).optional(),
  enableDuplicateClickAction: Joi.boolean().optional(),
  duplicateClickAction: Joi.string()
    .valid("blank_page", "redirect_to_url", "show_message")
    .optional(),
  enableCampaignSchedule: Joi.boolean().optional(),
  campaignStartDate: Joi.date().iso().optional(),
  campaignEndDate: Joi.date().iso().optional(),
  campaignStatus: Joi.string().valid("active", "paused", "expired").optional(),
  enableScheduleStatusChange: Joi.boolean().optional(),
  statusToBeSet: Joi.string().valid("active", "paused").optional(),
  scheduleDate: Joi.date().iso().optional(),
  enablePublisherEmailNotify: Joi.boolean().optional(),
  publisherNotifyTime: Joi.date().iso().optional(),
  appName: Joi.string().optional(),
  appId: Joi.string().optional(),
  erid: Joi.string().optional(),
  conversionFlow: Joi.string().optional(),
  conversionFlowLanguages: Joi.alternatives()
    .try(Joi.array(), Joi.string())
    .optional(),
  unsubscribeUrl: Joi.string().uri().optional(),
  suppressionUrl: Joi.string().uri().optional(),
  enableDeepLink: Joi.boolean().optional(),
  conversionHoldPeriod: Joi.number().integer().min(0).optional(),
  conversionStatusAfterHold: Joi.string()
    .valid("approved", "rejected", "pending")
    .optional(),
  revenueModel: Joi.string().valid("fixed", "revshare", "hybrid").optional(),
  currency: Joi.string().length(3).optional(),
  defaultGoalName: Joi.string().optional(),
  revenue: Joi.number().precision(2).optional(),
  payout: Joi.number().precision(2).optional(),
  geoCoverage: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),
  category: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),
  devices: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),
  operatingSystem: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),
  carrierTargeting: Joi.alternatives()
    .try(Joi.array(), Joi.string())
    .optional(),
  allowedTrafficChannels: Joi.alternatives()
    .try(Joi.array(), Joi.string())
    .optional(),
  note: Joi.string().optional(),
  termsAndConditions: Joi.string().optional(),
  requireTermsAcceptance: Joi.boolean().optional(),
  conversionTracking: Joi.string()
    .valid("server_postback", "web_sdk", "iframe_pixel", "image_pixel")
    .optional(),
  primaryTrackingDomain: Joi.string().optional(),
  status: Joi.string().valid("active", "pending", "paused").optional(),
  redirectType: Joi.string().valid("301", "302").optional(),
  visibility: Joi.string()
    .valid("public", "private", "ask_permission")
    .optional(),
  kpi: Joi.string().optional(),
  externalOfferId: Joi.string().optional(),
  thumbnail: Joi.string().optional(),
  trackingDomain: Joi.string().optional(),
  trackingSlug: Joi.string().optional(),
};

const createCampaignValidator = Joi.object(baseCampaignFields);

const updateCampaignValidator = Joi.object({
  id: Joi.number().integer().positive().required(),
  ...baseCampaignFields,
});

const getCampaignValidator = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const updateStatusValidator = Joi.object({
  id: Joi.number().integer().positive().required(),
  status: Joi.string().valid("active", "paused", "expired").required(),
});

module.exports = {
  createCampaignValidator,
  updateCampaignValidator,
  getCampaignValidator,
  updateStatusValidator,
};
