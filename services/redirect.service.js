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

    // 🍪 CHROME-COMPATIBLE COOKIE SOLUTIONS
    console.log(`🔒 Server: ${req.get("host")}`);
    console.log(`🔒 Protocol: ${req.protocol}`);
    console.log(`🔒 Referer: ${referer}`);

    // SOLUTION 1: First-party cookie (works best in Chrome)
    // Only set if we're on the same domain as the target
    if (
      req.get("host").includes("afftrex.org") ||
      req.get("host").includes("shortifynow.in")
    ) {
      res.cookie("click_id", clickId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: false,
        secure: true,
        sameSite: "Lax", // Most compatible for same-site
        path: "/",
        domain: req.get("host").includes("afftrex.org")
          ? ".afftrex.org"
          : undefined,
      });

      console.log(`🍪 Set first-party cookie for: ${req.get("host")}`);
    }

    // SOLUTION 2: Partitioned cookie (Chrome 118+)
    // This is the new way to handle third-party cookies
    res.setHeader("Set-Cookie", [
      `click_id_partitioned=${clickId}; Max-Age=${
        30 * 24 * 60 * 60
      }; Secure; SameSite=None; Partitioned; Path=/`,
      `click_id_backup=${clickId}; Max-Age=${
        30 * 24 * 60 * 60
      }; Secure; SameSite=Lax; Path=/`,
    ]);

    // SOLUTION 3: URL parameter fallback (most reliable)
    const redirectUrl = new URL(campaign.defaultCampaignUrl);
    redirectUrl.searchParams.append("clickId", clickId);
    redirectUrl.searchParams.append("cid", clickId); // Backup parameter
    redirectUrl.searchParams.append("utm_source", "afftrex");
    redirectUrl.searchParams.append("utm_medium", "redirect");

    // SOLUTION 4: Local storage via iframe (for cross-domain)
    const storageHtml = generateStorageIframe(
      clickId,
      campaign.defaultCampaignUrl
    );

    console.log(`🔄 Redirecting to: ${redirectUrl.toString()}`);

    // Return both redirect URL and storage HTML
    return {
      redirectUrl: redirectUrl.toString(),
      clickId,
      storageHtml: storageHtml,
    };
  } catch (err) {
    console.error("🔥 Tracking error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Generate iframe for cross-domain local storage
function generateStorageIframe(clickId, targetUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Redirecting...</title>
        <style>
            body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif; 
                background: #f5f5f5;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .loader {
                text-align: center;
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="loader">
            <div class="spinner"></div>
            <h3>Redirecting...</h3>
            <p>Please wait while we redirect you to your destination.</p>
        </div>
        
        <script>
            // Multiple storage strategies for maximum compatibility
            const clickId = '${clickId}';
            const targetUrl = '${targetUrl}';
            
            // Strategy 1: Local Storage (if available)
            try {
                localStorage.setItem('afftrex_click_id', clickId);
                localStorage.setItem('afftrex_click_time', Date.now());
                console.log('✅ Stored in localStorage');
            } catch (e) {
                console.warn('❌ localStorage blocked:', e.message);
            }
            
            // Strategy 2: Session Storage
            try {
                sessionStorage.setItem('afftrex_click_id', clickId);
                console.log('✅ Stored in sessionStorage');
            } catch (e) {
                console.warn('❌ sessionStorage blocked:', e.message);
            }
            
            // Strategy 3: Cookie (client-side attempt)
            try {
                document.cookie = 'afftrex_click_id=' + clickId + '; max-age=' + (30*24*60*60) + '; path=/; secure; samesite=lax';
                console.log('✅ Set client-side cookie');
            } catch (e) {
                console.warn('❌ Cookie blocked:', e.message);
            }
            
            // Strategy 4: URL hash for single-page apps
            const urlWithData = targetUrl + (targetUrl.includes('#') ? '&' : '#') + 'clickId=' + clickId;
            
            // Redirect after short delay to allow storage operations
            setTimeout(() => {
                console.log('🔄 Redirecting to:', urlWithData);
                window.location.href = urlWithData;
            }, 1500);
            
            // Fallback: immediate redirect if user clicks
            document.addEventListener('click', () => {
                window.location.href = urlWithData;
            });
        </script>
    </body>
    </html>
  `;
}
