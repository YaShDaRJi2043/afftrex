const { Campaign, CampaignTracking, PixelTracking } = require("@models");

exports.trackPixel = async (slug, data, req) => {
  console.log("Tracking pixel:", { slug, data, cookies: req.cookies });

  const campaign = await Campaign.findOne({ where: { trackingSlug: slug } });
  if (!campaign) throw new Error("Invalid tracking slug");

  // Extract clickId from the cookie
  const clickId = req.cookies?.click_id;
  console.log(clickId);
  // if (!clickId) throw new Error("Missing clickId in cookies");

  // Find tracking using clickId
  const tracking = await CampaignTracking.findOne({
    where: { clickId },
    order: [["createdAt", "DESC"]],
  });
  if (!tracking) throw new Error("No campaign tracking found");

  const { transactionId, saleAmount, currency, conversionStatus } = data;

  // Extract pageUrl from the request or data
  const pageUrl =
    req.query.pageUrl || data.pageUrl || req.headers.referer || "unknown";

  try {
    await PixelTracking.create({
      trackingId: tracking.id,
      transactionId,
      saleAmount,
      currency,
      clickId, // Use clickId instead of sessionId
      pageUrl, // Ensure pageUrl is provided
      pixelType: "iframe",
      clickTime: new Date(),
      clickCount: 1,
      conversionValue: saleAmount,
      conversionStatus,
      conversionTime: new Date(),
    });
    console.log("Pixel tracking data inserted successfully");
  } catch (error) {
    console.error("Error inserting pixel tracking data:", error);
    throw new Error("Failed to insert pixel tracking data");
  }

  return clickId;
};
