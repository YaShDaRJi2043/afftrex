const { Campaign, CampaignAssignment, CampaignTracking } = require("@models");
const geoip = require("geoip-lite");
const { Op } = require("sequelize");
const UAParser = require("ua-parser-js");
const { v4: uuidv4 } = require("uuid");

exports.trackClick = async (req, res) => {
  try {
    const shortCampaignId = req.params.campaignId; // hashed
    const shortPublisherId = req.query.pub; // hashed

    if (!shortCampaignId || !shortPublisherId) {
      return res.status(400).json({
        success: false,
        message: "Missing campaign or publisher ID.",
      });
    }

    // Find matching assignment by hashed ID
    const assignment = await CampaignAssignment.findOne({
      where: {
        publisherLink: {
          [Op.like]: `%/c/${shortCampaignId}?pub=${shortPublisherId}%`,
        },
      },
      include: [{ model: Campaign, as: "campaign" }],
    });

    if (!assignment?.campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign or publisher not found.",
      });
    }

    const campaign = assignment.campaign;

    if (campaign.campaignStatus !== "active") {
      return res.status(404).json({
        success: false,
        message: "Campaign not active.",
      });
    }

    // IP & UA info
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const referer = req.headers["referer"] || null;
    const geo = geoip.lookup(ip);
    const ua = new UAParser(userAgent).getResult();

    const now = new Date();

    // Time restrictions
    const start = campaign.campaignStartDate
      ? new Date(campaign.campaignStartDate)
      : null;
    const end = campaign.campaignEndDate
      ? new Date(campaign.campaignEndDate)
      : null;

    if ((start && now < start) || (end && now > end)) {
      return res.status(400).json({
        success: false,
        message: "Campaign not active at this time.",
      });
    }

    // Time targeting
    if (campaign.enableTimeTargeting) {
      const dayName = now.toLocaleString("en-US", {
        weekday: "long",
        timeZone: campaign.timezone,
      });
      const hour = parseInt(
        now.toLocaleString("en-US", {
          hour: "2-digit",
          hour12: false,
          timeZone: campaign.timezone,
        })
      );

      const activeDays = campaign.activeDays || [];
      if (
        !activeDays.includes(dayName) ||
        hour < campaign.startHour ||
        hour > campaign.endHour
      ) {
        return res.status(400).json({
          success: false,
          message: "Click not allowed due to time targeting restriction.",
        });
      }
    }

    // Geo
    if (
      campaign.geoCoverage &&
      campaign.geoCoverage.length > 0 &&
      (!geo || !campaign.geoCoverage.includes(geo.country))
    ) {
      return res.status(400).json({
        success: false,
        message: "Click not allowed from your country.",
      });
    }

    // Device
    const deviceType = ua.device.type || "desktop";
    if (
      campaign.devices &&
      campaign.devices.length > 0 &&
      !campaign.devices.includes(deviceType)
    ) {
      return res.status(400).json({
        success: false,
        message: `Device type '${deviceType}' not allowed.`,
      });
    }

    // OS
    if (
      campaign.operatingSystem &&
      campaign.operatingSystem.length > 0 &&
      (!ua.os.name || !campaign.operatingSystem.includes(ua.os.name))
    ) {
      return res.status(400).json({
        success: false,
        message: `Operating system '${ua.os.name}' not allowed.`,
      });
    }

    // Carrier (placeholder)
    const carrier = null;
    if (
      campaign.carrierTargeting &&
      campaign.carrierTargeting.length > 0 &&
      carrier &&
      !campaign.carrierTargeting.includes(carrier)
    ) {
      return res.status(400).json({
        success: false,
        message: "Carrier not allowed.",
      });
    }

    // Generate unique clickId
    const clickId = uuidv4();

    // Track the click
    await CampaignTracking.create({
      campaignId: campaign.id,
      assignmentId: assignment.id,
      ipAddress: ip,
      userAgent,
      referer,
      country: geo?.country || null,
      region: geo?.region || null,
      city: geo?.city || null,
      device: deviceType,
      os: ua.os.name || null,
      browser: ua.browser.name || null,
      carrier: null,
      eventType: "click",
      customParams: req.query || {},
      clickId, // Include clickId
    });

    // Append clickId to the redirect URL
    const redirectUrl = new URL(campaign.defaultCampaignUrl);
    redirectUrl.searchParams.append("clickId", clickId);

    return res.redirect(302, redirectUrl.toString());
  } catch (err) {
    console.error("🔥 Tracking error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
