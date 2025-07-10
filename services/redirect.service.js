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

    // ⏰ Time targeting
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
        console.log("Time targeting mismatch");
        return res.redirect(302, campaign.defaultCampaignUrl);
      }
    }

    // 🌍 Geo targeting
    if (campaign.geoCoverage && campaign.geoCoverage.length > 0) {
      if (!geo || !campaign.geoCoverage.includes(geo.country)) {
        console.log("Geo targeting mismatch");
        return res.redirect(302, campaign.defaultCampaignUrl);
      }
    }

    // 📱 Device targeting
    if (campaign.devices && campaign.devices.length > 0) {
      const deviceType = ua.device.type || "desktop";
      if (!campaign.devices.includes(deviceType)) {
        console.log("Device targeting mismatch");
        return res.redirect(302, campaign.defaultCampaignUrl);
      }
    }

    if (campaign.operatingSystem && campaign.operatingSystem.length > 0) {
      if (!ua.os.name || !campaign.operatingSystem.includes(ua.os.name)) {
        console.log("OS targeting mismatch");
        return res.redirect(302, campaign.defaultCampaignUrl);
      }
    }

    if (campaign.carrierTargeting && campaign.carrierTargeting.length > 0) {
      const carrier = null;
      if (carrier && !campaign.carrierTargeting.includes(carrier)) {
        console.log("Carrier targeting mismatch");
        return res.redirect(302, campaign.defaultCampaignUrl);
      }
    }

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
      console.log("Duplicate click ignored.");
      return res.redirect(302, campaign.defaultCampaignUrl);
    }

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
    console.error("Tracking error:", err);
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
