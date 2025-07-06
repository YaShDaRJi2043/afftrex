const { Campaign, CampaignAssignment, CampaignTracking } = require("@models");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");

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
    if (!campaign || campaign.campaignStatus != "active") {
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

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const referer = req.headers["referer"] || null;

    const geo = geoip.lookup(ip);

    const parser = new UAParser();
    const ua = parser.setUA(userAgent).getResult();

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
