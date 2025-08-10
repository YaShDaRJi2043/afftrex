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

  const { transactionId, saleAmount, currency, conversionStatus } = data;

  // Extract clickId from the cookie
  const clickId = req.cookies?.clickId;
  if (!clickId) throw new Error("Missing clickId in cookies");

  await PixelTracking.create({
    trackingId: tracking.id,
    transactionId,
    saleAmount,
    currency,
    clickId, // Use clickId instead of sessionId
    pageUrl,
    pixelType: "iframe",
    clickTime: new Date(),
    clickCount: 1,
    conversionValue: saleAmount,
    conversionStatus,
    conversionTime: new Date(),
  });

  return clickId;
};
