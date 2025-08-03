const { Campaign, CampaignTracking, PixelTracking } = require("@models");
const { v4: uuidv4 } = require("uuid");

exports.trackPixel = async (slug, data, req) => {
  const campaign = await Campaign.findOne({ where: { trackingSlug: slug } });
  if (!campaign) throw new Error("Invalid tracking slug");

  const tracking = await CampaignTracking.findOne({
    where: { campaignId: campaign.id },
    order: [["createdAt", "DESC"]],
  });
  if (!tracking) throw new Error("No campaign tracking found");

  const { transactionId, saleAmount, currency, p1, p2, p3, p4 } = data;

  // Extract sessionId (or generate one)
  let sessionId =
    req.cookies?.sessionId ||
    req.headers["x-session-id"] ||
    req.query?.sessionId ||
    uuidv4(); // fallback

  // Extract IP address (from header or req.ip)
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",").shift() ||
    req.socket?.remoteAddress ||
    req.ip;

  const userAgent = req.headers["user-agent"] || null;
  const pageUrl = req.headers.referer || null;

  await PixelTracking.create({
    trackingId: tracking.id,
    transactionId,
    saleAmount,
    currency,
    p1,
    p2,
    p3,
    p4,
    sessionId,
    pageUrl,
    clickTime: new Date(),
    clickCount: 1,
    ipAddress,
    userAgent,
  });

  return sessionId; // for setting cookie if needed
};
