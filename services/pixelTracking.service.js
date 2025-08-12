const { Campaign, CampaignTracking, PixelTracking } = require("@models");

exports.trackPixel = async (slug, data, req) => {
  console.log("Tracking pixel:", { slug, data, cookies: req.cookies });

  const campaign = await Campaign.findOne({ where: { trackingSlug: slug } });
  if (!campaign) throw new Error("Invalid tracking slug");

  // Extract clickId from the cookie
  const clickId = req.cookies?.clickId;
  console.log(clickId);
  // if (!clickId) throw new Error("Missing clickId in cookies");

  // Find tracking using clickId
  const tracking = await CampaignTracking.findOne({
    where: { clickId },
    order: [["createdAt", "DESC"]],
  });
  if (!tracking) throw new Error("No campaign tracking found");

  const { transactionId, saleAmount, currency, conversionStatus } = data;

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
