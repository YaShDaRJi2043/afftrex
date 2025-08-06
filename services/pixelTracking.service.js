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

  const {
    transactionId,
    saleAmount,
    currency,
    p1,
    p2,
    p3,
    p4,
    conversionValue,
    conversionStatus,
  } = data;

  // Extract sessionId (or generate one)
  let sessionId =
    req.cookies?.sessionId ||
    req.headers["x-session-id"] ||
    req.query?.sessionId ||
    uuidv4(); // fallback

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
    pixelType: "iframe",
    clickTime: new Date(),
    clickCount: 1,
    conversionValue,
    conversionStatus,
    conversionTime: new Date(),
  });

  return sessionId;
};
