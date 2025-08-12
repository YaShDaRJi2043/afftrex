const { Campaign, CampaignAssignment, CampaignTracking } = require("@models");
const geoip = require("geoip-lite");
const { Op } = require("sequelize");
const UAParser = require("ua-parser-js");
const { v4: uuidv4 } = require("uuid");

exports.trackClick = async (req, res, providedClickId) => {
  try {
    const shortCampaignId = req.params.campaignId;
    const shortPublisherId = req.query.pub;

    if (!shortCampaignId || !shortPublisherId) {
      // Keep using res here so controller can bail out by checking res.headersSent
      return res.status(400).json({
        success: false,
        message: "Missing campaign or publisher ID.",
      });
    }

    // Find assignment + campaign
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
      return res.status(403).json({
        success: false,
        message: "Campaign not active.",
      });
    }

    // metadata
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const referer = req.headers["referer"] || null;
    const geo = geoip.lookup(ip);
    const ua = new UAParser(userAgent).getResult();
    const now = new Date();

    // date range checks
    const start = campaign.campaignStartDate
      ? new Date(campaign.campaignStartDate)
      : null;
    const end = campaign.campaignEndDate
      ? new Date(campaign.campaignEndDate)
      : null;
    if ((start && now < start) || (end && now > end)) {
      return res.status(403).json({
        success: false,
        message: "Campaign not active at this time.",
      });
    }

    // time targeting
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
      const isActiveDay =
        activeDays.length === 0 || activeDays.includes(dayName);
      if (
        !isActiveDay ||
        hour < campaign.startHour ||
        hour > campaign.endHour
      ) {
        return res.status(403).json({
          success: false,
          message: "Click not allowed due to time targeting.",
        });
      }
    }

    // geo targeting
    if (
      campaign.geoCoverage?.length &&
      !campaign.geoCoverage.includes("all") &&
      (!geo || !campaign.geoCoverage.includes(geo.country))
    ) {
      return res.status(403).json({
        success: false,
        message: "Click not allowed from your country.",
      });
    }

    // device/os/carrier targeting (same as your code)
    const deviceType = ua.device.type || "desktop";
    const allowedDevices = campaign.devices?.map((d) => d.toLowerCase()) || [];
    if (
      allowedDevices.length &&
      !allowedDevices.includes("all") &&
      !allowedDevices.includes(deviceType.toLowerCase())
    ) {
      return res.status(403).json({
        success: false,
        message: `Device type '${deviceType}' not allowed.`,
      });
    }

    const osName = ua.os.name || "";
    const allowedOS =
      campaign.operatingSystem?.map((os) => os.toLowerCase()) || [];
    if (
      allowedOS.length &&
      !allowedOS.includes("all") &&
      (!osName || !allowedOS.includes(osName.toLowerCase()))
    ) {
      return res.status(403).json({
        success: false,
        message: `OS '${osName}' not allowed.`,
      });
    }

    const carrier = null;
    if (
      campaign.carrierTargeting?.length &&
      carrier &&
      !campaign.carrierTargeting.includes(carrier)
    ) {
      return res.status(403).json({
        success: false,
        message: "Carrier not allowed.",
      });
    }

    // determine clickId (prefer provided from middleware)
    const clickId = providedClickId || req.cookies?.clickId || uuidv4();

    // Ensure cookie exists (in case middleware wasn't used)
    if (!req.cookies?.clickId) {
      const isSecure =
        req.secure ||
        (req.get("x-forwarded-proto") || "").split(",")[0].trim() === "https";

      res.cookie("clickId", clickId, {
        domain: ".afftrex.org",
        httpOnly: false,
        secure: isSecure,
        sameSite: "None",
        path: "/",
        maxAge: 90 * 24 * 60 * 60 * 1000,
      });
    }

    // Ensure the campaign URL is valid
    if (!campaign.defaultCampaignUrl) {
      return res.status(400).json({
        success: false,
        message: "Campaign URL is missing.",
      });
    }

    // Save the click in DB
    await CampaignTracking.create({
      campaignId: campaign.id,
      publisherId: assignment.publisherId,
      clickId,
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
      timestamp: now,
      p1: req.query.p1 || null,
      p2: req.query.p2 || null,
      p3: req.query.p3 || null,
      p4: req.query.p4 || null,
      redirectUrl: campaign.defaultCampaignUrl,
    });

    // Return values for controller
    return {
      clickId,
      redirectUrl: campaign.defaultCampaignUrl,
    };
  } catch (err) {
    console.error("🔥 Tracking error:", err);
    // Unexpected error -> bubble up so controller handles and responds
    throw err;
  }
};
