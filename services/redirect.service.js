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
    const isLocalhost =
      host.includes("localhost") || host.includes("127.0.0.1");

    // Calculate expiration (30 days from now)
    const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expires = expirationDate.toUTCString();

    // Build cookie strings manually (like PHP setcookie)
    const cookieOptions = [];

    // Method 1: Primary cookie for current domain (no cross-domain issues)
    cookieOptions.push(
      `click_id=${encodeURIComponent(
        clickId
      )}; Expires=${expires}; Path=/; SameSite=Lax; HttpOnly=false`
    );

    // Method 2: Try domain cookie only if not localhost
    if (!isLocalhost) {
      if (isHttps) {
        // For HTTPS - use SameSite=None with Secure for cross-origin
        cookieOptions.push(
          `click_id_domain=${encodeURIComponent(
            clickId
          )}; Expires=${expires}; Path=/; Domain=.afftrex.org; Secure; SameSite=None; HttpOnly=false`
        );
      } else {
        // For HTTP - can't use SameSite=None, so use Lax with domain
        cookieOptions.push(
          `click_id_domain=${encodeURIComponent(
            clickId
          )}; Expires=${expires}; Path=/; Domain=.afftrex.org; SameSite=Lax; HttpOnly=false`
        );
      }
    }

    // Method 3: Session cookie (survives browser session)
    cookieOptions.push(
      `click_id_session=${encodeURIComponent(
        clickId
      )}; Path=/; SameSite=Lax; HttpOnly=false`
    );

    // Method 4: Long-term backup without domain
    cookieOptions.push(
      `click_id_backup=${encodeURIComponent(
        clickId
      )}; Expires=${expires}; Path=/; SameSite=Lax; HttpOnly=false`
    );

    // Method 5: Try to set on redirect domain via intermediate HTML page
    const shouldUseIntermediatePage =
      !isLocalhost && campaign.defaultCampaignUrl.includes("shortifynow.in");

    if (shouldUseIntermediatePage) {
      // Create HTML page that sets cookie and then redirects
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Redirecting...</title>
    <script>
        // Set cookie on current domain first
        document.cookie = 'click_id=${clickId}; expires=${expires}; path=/; SameSite=Lax';
        document.cookie = 'click_id_js=${clickId}; expires=${expires}; path=/; SameSite=Lax';
        
        // Redirect after setting cookie
        setTimeout(function() {
            window.location.href = '${campaign.defaultCampaignUrl}?clickId=${clickId}';
        }, 100);
    </script>
    <meta http-equiv="refresh" content="1;url=${campaign.defaultCampaignUrl}?clickId=${clickId}">
</head>
<body>
    <p>Setting tracking cookie and redirecting...</p>
    <p>If you are not redirected automatically, <a href="${campaign.defaultCampaignUrl}?clickId=${clickId}">click here</a>.</p>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html");
      res.setHeader("Set-Cookie", cookieOptions);
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

      console.log(`🍪 Using HTML intermediate page for cross-domain cookie`);
      console.log(`🍪 Cookie options:`, cookieOptions);

      return res.send(htmlContent);
    }

    // Set cookies using Set-Cookie header (like PHP)
    res.setHeader("Set-Cookie", cookieOptions);

    // Additional headers to ensure proper handling
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // CORS headers if needed for cross-origin requests
    const origin = req.headers.origin;
    if (
      origin &&
      (origin.includes("afftrex") || origin.includes("shortifynow"))
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

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
