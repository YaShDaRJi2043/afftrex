const { Campaign, CampaignAssignment, CampaignTracking } = require("@models");
const geoip = require("geoip-lite");
const { Op } = require("sequelize");
const UAParser = require("ua-parser-js");
const { v4: uuidv4 } = require("uuid");

exports.trackClick = async (req, res) => {
  try {
    const shortCampaignId = req.params.campaignId;
    const shortPublisherId = req.query.pub;

    if (!shortCampaignId || !shortPublisherId) {
      return res.status(400).json({
        success: false,
        message: "Missing campaign or publisher ID.",
      });
    }

    // 🔍 Find CampaignAssignment + Campaign
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

    // 🧠 Metadata: IP, UA, Geo, Time
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const referer = req.headers["referer"] || null;
    const geo = geoip.lookup(ip);
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
      return res.status(403).json({
        success: false,
        message: "Campaign not active at this time.",
      });
    }

    // 🎯 Time targeting
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

      // ✅ Allow all days if activeDays is empty
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

    // 🌍 Geo targeting
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

    // 💻 Device targeting
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

    // 🖥️ OS targeting
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

    // 📶 Carrier targeting (placeholder logic)
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

    // 🍪 BACKEND-ONLY COOKIE SOLUTION (PHP-style)
    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
    const host = req.get("host");

    // Calculate expiration (30 days from now)
    const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expires = expirationDate.toUTCString();

    // Build cookie strings manually (like PHP setcookie)
    const cookieOptions = [];

    // Method 1: Primary cookie with proper SameSite handling
    if (isHttps) {
      // For HTTPS - use SameSite=None for cross-origin
      cookieOptions.push(
        `click_id=${encodeURIComponent(
          clickId
        )}; Expires=${expires}; Path=/; Domain=.afftrex.org; Secure; SameSite=None; HttpOnly=false`
      );
    } else {
      // For HTTP - use SameSite=Lax
      cookieOptions.push(
        `click_id=${encodeURIComponent(
          clickId
        )}; Expires=${expires}; Path=/; SameSite=Lax; HttpOnly=false`
      );
    }

    // Method 2: Backup cookie without domain restrictions
    cookieOptions.push(
      `click_id_backup=${encodeURIComponent(
        clickId
      )}; Expires=${expires}; Path=/; SameSite=Lax; HttpOnly=false`
    );

    // Method 3: Session-based cookie (no expiration)
    cookieOptions.push(
      `click_id_session=${encodeURIComponent(
        clickId
      )}; Path=/; SameSite=Lax; HttpOnly=false`
    );

    // Method 4: Partitioned cookie for third-party contexts (Chrome 118+)
    if (isHttps) {
      cookieOptions.push(
        `click_id_partitioned=${encodeURIComponent(
          clickId
        )}; Expires=${expires}; Path=/; Secure; SameSite=None; Partitioned; HttpOnly=false`
      );
    }

    // Set all cookies using Set-Cookie header (like PHP)
    res.setHeader("Set-Cookie", cookieOptions);

    // Additional headers to ensure proper handling
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // CORS headers if needed for cross-origin requests
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    console.log(`🍪 Setting cookies for clickId: ${clickId}`);
    console.log(`🍪 Cookie options:`, cookieOptions);
    console.log(`🔒 HTTPS: ${isHttps}, Host: ${host}`);

    // Build redirect URL
    const redirectUrl = new URL(campaign.defaultCampaignUrl);
    redirectUrl.searchParams.append("clickId", clickId);

    console.log(`🔄 Redirecting to: ${redirectUrl.toString()}`);

    // Return URL for controller to handle redirect
    return { redirectUrl: redirectUrl.toString(), clickId };
  } catch (err) {
    console.error("🔥 Tracking error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
