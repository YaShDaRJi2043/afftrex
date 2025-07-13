const {
  Campaign,
  CampaignAssignment,
  CampaignTracking,
  Publisher,
} = require("@models");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const { Op, Sequelize } = require("sequelize");

exports.trackClick = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const publisherId = req.query.pub;

    if (!campaignId || !publisherId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: missing campaignId or publisherId",
      });
    }

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign || campaign.campaignStatus !== "active") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found or inactive",
      });
    }

    const assignment = await CampaignAssignment.findOne({
      where: { campaignId, publisherId },
    });
    if (!assignment || assignment.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Campaign not assigned to this publisher",
      });
    }

    // Get IP, geo and UA info
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const referer = req.headers["referer"] || null;
    const geo = geoip.lookup(ip);
    const parser = new UAParser();
    const ua = parser.setUA(userAgent).getResult();

    const now = new Date();

    // Campaign start/end date validation
    if (campaign.enableCampaignSchedule) {
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

    // // Geo targeting
    // if (campaign.geoCoverage && campaign.geoCoverage.length > 0) {
    //   if (!geo || !campaign.geoCoverage.includes(geo.country)) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Click not allowed from your country (geo mismatch).",
    //     });
    //   }
    // }

    // Device targeting
    if (campaign.devices && campaign.devices.length > 0) {
      const deviceType = ua.device.type || "desktop";
      if (!campaign.devices.includes(deviceType)) {
        return res.status(400).json({
          success: false,
          message: `Device type '${deviceType}' not allowed.`,
        });
      }
    }

    // OS targeting
    if (campaign.operatingSystem && campaign.operatingSystem.length > 0) {
      if (!ua.os.name || !campaign.operatingSystem.includes(ua.os.name)) {
        return res.status(400).json({
          success: false,
          message: `Operating system '${ua.os.name}' not allowed.`,
        });
      }
    }

    // Carrier targeting
    if (campaign.carrierTargeting && campaign.carrierTargeting.length > 0) {
      const carrier = null; // Placeholder for future carrier detection
      if (carrier && !campaign.carrierTargeting.includes(carrier)) {
        return res.status(400).json({
          success: false,
          message: "Carrier not allowed.",
        });
      }
    }

    // Prevent duplicate clicks
    const existingClick = await CampaignTracking.findOne({
      where: {
        campaignId,
        assignmentId: assignment.id,
        ipAddress: ip,
        userAgent,
        eventType: "click",
      },
    });

    if (existingClick) {
      return res.status(400).json({
        success: false,
        message: "Duplicate click — already tracked.",
      });
    }

    // Create click tracking
    await CampaignTracking.create({
      campaignId,
      assignmentId: assignment.id,
      ipAddress: ip,
      userAgent,
      referer,
      country: geo?.country || null,
      region: geo?.region || null,
      city: geo?.city || null,
      device: ua.device.type || "desktop",
      os: ua.os.name || null,
      browser: ua.browser.name || null,
      carrier: null,
      eventType: "click",
      customParams: req.query || {},
    });

    return res.redirect(302, campaign.defaultCampaignUrl);
  } catch (err) {
    console.error("🔥 Tracking error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getTrackingData = async (req, res) => {
  try {
    const {
      campaignId,
      publisherId,
      eventType,
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (page - 1) * limit;

    const where = {};

    if (campaignId) where.campaignId = campaignId;
    if (publisherId)
      where.assignmentId = {
        [Op.in]: Sequelize.literal(`(
        SELECT id FROM campaign_assignments WHERE publisher_id = ${publisherId}
      )`),
      };
    if (eventType) where.eventType = eventType;

    const trackingData = await CampaignTracking.findAndCountAll({
      where,
      limit: +limit,
      offset: +offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Campaign,
          as: "campaign",
          attributes: ["id", "title", "defaultCampaignUrl"],
        },
        {
          model: CampaignAssignment,
          as: "assignment",
          attributes: ["id", "publisherId"],
          include: [
            {
              model: Publisher,
              as: "publisher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Tracking data fetched successfully",
      total: trackingData.count,
      data: trackingData.rows,
    });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
