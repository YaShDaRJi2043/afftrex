const moment = require("moment-timezone");

function isActiveByTime(campaign) {
  if (!campaign.enableTimeTargeting) return true;

  const now = moment().tz(campaign.timezone);
  const currentHour = now.hour();
  const currentDay = now.format("dddd").toLowerCase();

  if (campaign.activeDays && campaign.activeDays.length > 0) {
    if (!campaign.activeDays.includes(currentDay)) {
      return false;
    }
  }
  if (campaign.enableInactiveHours) {
    return currentHour >= campaign.startHour && currentHour < campaign.endHour;
  } else {
    return !(
      currentHour >= campaign.startHour && currentHour < campaign.endHour
    );
  }
}

function isActiveBySchedule(campaign) {
  if (!campaign.enableCampaignSchedule) return true;

  const now = moment();
  const startDate = campaign.campaignStartDate
    ? moment(campaign.campaignStartDate)
    : null;
  const endDate = campaign.campaignEndDate
    ? moment(campaign.campaignEndDate)
    : null;

  if (startDate && now.isBefore(startDate)) return false;
  if (endDate && now.isAfter(endDate)) return false;

  return true;
}

function getEffectiveStatus(campaign) {
  if (campaign.campaignStatus !== "active") return campaign.campaignStatus;
  if (!this.isActiveBySchedule(campaign)) return "expired";
  if (!this.isActiveByTime(campaign)) return "paused";

  return "active";
}

function generateTrackingUrl(campaign, publisherId = null, subId = null) {
  const baseUrl =
    campaign.trackingDomain ||
    process.env.DEFAULT_TRACKING_DOMAIN ||
    "https://track.example.com";
  const slug = campaign.trackingSlug;

  let url = `${baseUrl}/${slug}`;

  const params = new URLSearchParams();
  if (publisherId) params.append("pub", publisherId);
  if (subId) params.append("sub", subId);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  return url;
}

function isGeoAllowed(campaign, countryCode) {
  if (!campaign.geoCoverage || campaign.geoCoverage.length === 0) return true;
  return campaign.geoCoverage.includes(countryCode);
}

function isDeviceAllowed(campaign, deviceType) {
  if (!campaign.devices || campaign.devices.length === 0) return true;
  return campaign.devices.includes(deviceType);
}

function isOSAllowed(campaign, osName) {
  if (!campaign.operatingSystem || campaign.operatingSystem.length === 0)
    return true;
  return campaign.operatingSystem.includes(osName);
}

function isTrafficChannelAllowed(campaign, channel) {
  if (
    !campaign.allowedTrafficChannels ||
    campaign.allowedTrafficChannels.length === 0
  )
    return true;
  return campaign.allowedTrafficChannels.includes(channel);
}

function calculateRevenue(campaign, conversionValue = 1) {
  switch (campaign.revenueModel) {
    case "fixed":
      return parseFloat(campaign.revenue) || 0;
    case "revshare":
      return (parseFloat(campaign.revenue) / 100) * conversionValue;
    case "hybrid":
      const fixed = parseFloat(campaign.revenue) || 0;
      const revshare = (parseFloat(campaign.payout) / 100) * conversionValue;
      return fixed + revshare;
    default:
      return 0;
  }
}

function formatCampaignResponse(campaign) {
  const campaignData = campaign.toJSON ? campaign.toJSON() : campaign;

  return {
    ...campaignData,
    effectiveStatus: this.getEffectiveStatus(campaignData),
    trackingUrl: this.generateTrackingUrl(campaignData),
    isActiveByTime: this.isActiveByTime(campaignData),
    isActiveBySchedule: this.isActiveBySchedule(campaignData),
  };
}

module.exports = {
  isActiveByTime,
  isActiveBySchedule,
  getEffectiveStatus,
  generateTrackingUrl,
  isGeoAllowed,
  isDeviceAllowed,
  isOSAllowed,
  isTrafficChannelAllowed,
  calculateRevenue,
  formatCampaignResponse,
};
