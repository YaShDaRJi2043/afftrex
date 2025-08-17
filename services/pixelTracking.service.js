const { Campaign, CampaignTracking, PixelTracking } = require("@models");

exports.trackPixel = async (slug, data, req) => {
  const campaign = await Campaign.findOne({ where: { trackingSlug: slug } });
  if (!campaign) throw new Error("Invalid tracking slug");

  // Extract clickId from the cookie
  const clickId = req.cookies?.click_id;
  if (!clickId) throw new Error("Missing clickId in cookies");

  // Find tracking using clickId
  const tracking = await CampaignTracking.findOne({
    where: { clickId },
    order: [["createdAt", "DESC"]],
  });
  if (!tracking) throw new Error("No campaign tracking found");

  const { transaction_id, saleAmount, currency, conversionStatus } = data;

  // Extract pageUrl from the request or data
  const pageUrl =
    req.query.pageUrl || data.pageUrl || req.headers.referer || "unknown";

  try {
    await PixelTracking.create({
      campaignId: campaign.id,
      trackingId: tracking.id,
      transactionId: transaction_id,
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

exports.trackPostback = async (slug, data) => {
  const campaign = await Campaign.findOne({ where: { trackingSlug: slug } });
  if (!campaign) throw new Error("Invalid tracking slug");

  // Extract clickId from postback (sent by advertiser)
  const clickId = data.click_id;
  if (!clickId) throw new Error("Missing clickId in postback");

  // Validate clickId
  const tracking = await CampaignTracking.findOne({
    where: { clickId },
    order: [["createdAt", "DESC"]],
  });
  if (!tracking) throw new Error("No campaign tracking found");

  const { transaction_id, amount, currency, status, token } = data;

  // Security check (optional, highly recommended)
  if (token !== process.env.POSTBACK_TOKEN) {
    throw new Error("Unauthorized postback");
  }

  // Check duplicate transaction
  const existing = await PixelTracking.findOne({
    where: { transactionId: transaction_id },
  });
  if (existing) throw new Error("Duplicate transaction");

  // Save conversion
  await PixelTracking.create({
    campaignId: campaign.id,
    trackingId: tracking.id,
    transactionId: transaction_id,
    saleAmount: amount,
    currency,
    clickId,
    pageUrl: "postback", // static since no referer
    pixelType: "postback",
    eventType: "conversion",
    conversionStatus: status || "completed",
    conversionValue: amount,
    conversionTime: new Date(),
  });

  return clickId;
};
