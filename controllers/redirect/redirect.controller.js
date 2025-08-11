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

    // 🍪 COMPREHENSIVE COOKIE SOLUTION
    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
    const host = req.get("host");
    const isLocalhost =
      host.includes("localhost") || host.includes("127.0.0.1");

    // Method 1: Standard cookie (works for same-origin)
    if (isHttps) {
      res.cookie("click_id", clickId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: true,
        sameSite: "None",
        httpOnly: false,
        path: "/",
      });
    } else {
      res.cookie("click_id", clickId, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: false,
        sameSite: "Lax",
        httpOnly: false,
        path: "/",
      });
    }

    // Method 2: Try domain-specific cookie for afftrex.org
    if (!isLocalhost) {
      try {
        res.cookie("click_id_domain", clickId, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          domain: ".afftrex.org",
          secure: isHttps,
          sameSite: isHttps ? "None" : "Lax",
          httpOnly: false,
          path: "/",
        });
      } catch (e) {
        console.log("Domain cookie failed:", e.message);
      }
    }

    // Method 3: Partitioned cookie for third-party contexts (Chrome 118+)
    if (isHttps) {
      res.setHeader("Set-Cookie", [
        ...(res.getHeaders()["set-cookie"] || []),
        `click_id_partitioned=${clickId}; Max-Age=${
          30 * 24 * 60 * 60
        }; Path=/; Secure; SameSite=None; Partitioned`,
      ]);
    }

    // Method 4: Return HTML with JavaScript cookie setting (for iframe contexts)
    const isIframeContext =
      req.query.iframe === "1" || req.headers["sec-fetch-dest"] === "iframe";

    if (isIframeContext) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Setting Cookie...</title>
            <script>
                // Try multiple cookie setting methods
                const clickId = '${clickId}';
                const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
                
                // Method 1: Standard JavaScript
                document.cookie = 'click_id=' + clickId + '; expires=' + expires + '; path=/; SameSite=Lax';
                
                // Method 2: Try with domain (if not localhost)
                if (!location.hostname.includes('localhost')) {
                    document.cookie = 'click_id_js=' + clickId + '; expires=' + expires + '; path=/; domain=.afftrex.org; SameSite=None; Secure';
                }
                
                // Method 3: localStorage as backup
                try {
                    localStorage.setItem('click_id', clickId);
                    localStorage.setItem('click_id_timestamp', Date.now().toString());
                } catch (e) {
                    console.log('localStorage not available');
                }
                
                // Method 4: sessionStorage as backup
                try {
                    sessionStorage.setItem('click_id', clickId);
                } catch (e) {
                    console.log('sessionStorage not available');
                }
                
                // Redirect after setting cookies
                setTimeout(() => {
                    window.location.href = '${campaign.defaultCampaignUrl}?clickId=${clickId}';
                }, 100);
            </script>
        </head>
        <body>
            <p>Setting tracking cookie and redirecting...</p>
        </body>
        </html>
      `;

      res.set({
        "Content-Type": "text/html",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      });

      return res.send(htmlContent);
    }

    // Standard redirect for non-iframe contexts
    const redirectUrl = new URL(campaign.defaultCampaignUrl);
    redirectUrl.searchParams.append("clickId", clickId);

    // Set cache control headers
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    console.log(`🍪 Cookie methods attempted for clickId: ${clickId}`);
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
