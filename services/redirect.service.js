// services/redirect.service.js
const { Campaign, CampaignAssignment, CampaignTracking } = require("@models");
const geoip = require("geoip-lite");
const { Op } = require("sequelize");
const UAParser = require("ua-parser-js");
const { v4: uuidv4 } = require("uuid");

function getClientIp(req) {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] || // if set by nginx
    req.socket?.remoteAddress ||
    null;

  if (!ip) return null;

  // Strip IPv6 prefix ::ffff:
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  // Handle IPv6 localhost
  if (ip === "::1") ip = "127.0.0.1";

  return ip;
}

exports.trackClick = async (req, res) => {
  try {
    const CampaignUniqueId = req.params.campaignId;
    const shortPublisherId = req.query.pub;

    if (!CampaignUniqueId || !shortPublisherId) {
      res
        .status(400)
        .json({ success: false, message: "Missing campaign or publisher ID." });
      return; // controller checks res.headersSent
    }

    // 🔍 Find CampaignAssignment + Campaign
    const assignment = await CampaignAssignment.findOne({
      where: {
        publisherLink: {
          [Op.like]: `%/c/${CampaignUniqueId}?pub=${shortPublisherId}%`,
        },
      },
      include: [{ model: Campaign, as: "campaign" }],
    });

    if (
      !assignment?.campaign ||
      assignment.campaign.unique_id !== CampaignUniqueId
    ) {
      res
        .status(404)
        .json({ success: false, message: "Campaign or publisher not found." });
      return;
    }

    const campaign = assignment.campaign;
    if (campaign.campaignStatus !== "active") {
      res.status(403).json({ success: false, message: "Campaign not active." });
      return;
    }

    // 🧠 Metadata: IP, UA, Geo, Time
    const ip = getClientIp(req);

    const userAgent = req.headers["user-agent"] || "";
    const referer = req.headers["referer"] || null;
    const geo = ip ? geoip.lookup(ip) : null;
    const ua = new UAParser(userAgent).getResult();
    const now = new Date();

    // 🕒 Date range validation
    const start = campaign.campaignStartDate
      ? new Date(campaign.campaignStartDate)
      : null;
    const end = campaign.campaignEndDate
      ? new Date(campaign.campaignEndDate)
      : null;
    if ((start && now < start) || (end && now > end)) {
      res
        .status(403)
        .json({ success: false, message: "Campaign not active at this time." });
      return;
    }

    // 🗓️ Time targeting
    if (campaign.enableTimeTargeting) {
      const tz = campaign.timezone || "UTC";
      const dayName = now.toLocaleString("en-US", {
        weekday: "long",
        timeZone: tz,
      });
      const hour = parseInt(
        now.toLocaleString("en-US", {
          hour: "2-digit",
          hour12: false,
          timeZone: tz,
        }),
        10
      );

      const activeDays = Array.isArray(campaign.activeDays)
        ? campaign.activeDays
        : [];
      const isActiveDay =
        activeDays.length === 0 || activeDays.includes(dayName);

      const startHour = Number.isFinite(campaign.startHour)
        ? campaign.startHour
        : 0;
      const endHour = Number.isFinite(campaign.endHour) ? campaign.endHour : 23;

      if (!isActiveDay || hour < startHour || hour > endHour) {
        res.status(403).json({
          success: false,
          message: "Click not allowed due to time targeting.",
        });
        return;
      }
    }

    // 📱 Device targeting
    const deviceType = (ua.device.type || "desktop").toLowerCase();
    const allowedDevices = (campaign.devices || []).map((d) =>
      String(d).toLowerCase()
    );
    if (
      allowedDevices.length &&
      !allowedDevices.includes("all") &&
      !allowedDevices.includes(deviceType)
    ) {
      res.status(403).json({
        success: false,
        message: `Device type '${deviceType}' not allowed.`,
      });
      return;
    }

    // 🖥️ OS targeting
    const osName = (ua.os.name || "").toLowerCase();
    const allowedOS = (campaign.operatingSystem || []).map((os) =>
      String(os).toLowerCase()
    );
    if (
      allowedOS.length &&
      !allowedOS.includes("all") &&
      (!osName || !allowedOS.includes(osName))
    ) {
      res.status(403).json({
        success: false,
        message: `OS '${ua.os.name || "Unknown"}' not allowed.`,
      });
      return;
    }

    // (Optional) Carrier targeting placeholder
    const carrier = null;
    if (
      Array.isArray(campaign.carrierTargeting) &&
      campaign.carrierTargeting.length
    ) {
      if (carrier && !campaign.carrierTargeting.includes(carrier)) {
        res
          .status(403)
          .json({ success: false, message: "Carrier not allowed." });
        return;
      }
    }

    // ✅ Generate clickId & track event
    const clickId = uuidv4();

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
    });

    // 🚀 Build redirect URL with clickId passthrough
    const redirectUrl = new URL(campaign.defaultCampaignUrl);
    redirectUrl.searchParams.append("clickId", clickId);

    // Service returns data; controller sets cookie & redirects
    return { redirectUrl: redirectUrl.toString(), clickId };
  } catch (err) {
    console.error("🔥 Tracking error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
