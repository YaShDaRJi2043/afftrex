// services/pixelTracking.service.js
const { Campaign, CampaignTracking, PixelTracking } = require("@models");

/**
 * Normalize incoming fields to support both PHP-style and JS-style names.
 */
function normalizeData(data = {}) {
  return {
    eventType: data.event_type || data.eventType || "",

    // parity with PHP
    transactionId: data.transaction_id || data.transactionId || null,

    // allow both sale_amount (PHP) and saleAmount (JS)
    saleAmount:
      data.sale_amount != null
        ? data.sale_amount
        : (() => {
            if (data.saleAmount != null) return data.saleAmount;
            return null;
          })(),
    currency: data.currency || null,
    conversionStatus: data.conversionStatus || data.status || null,

    // pass-through
    pageUrl: data.pageUrl || null,

    // MUST: click_id should come from query; cookie is only fallback
    clickId: data.click_id || data.clickId || null,
  };
}

/**
 * Pixel from browser (image pixel).
 * - Accept click_id from query FIRST (works cross-site).
 * - Fallback to cookie only if same-site (rare now due to 3P cookie blocking).
 * - Writes a PixelTracking row mirroring pixel.php behavior.
 */
exports.trackPixel = async (slug, data, req) => {
  const campaign = await Campaign.findOne({ where: { trackingSlug: slug } });
  if (!campaign) throw new Error("Invalid tracking slug");

  const n = normalizeData(data);

  // 1) Resolve clickId: query first, then cookie
  const clickId =
    n.clickId || req.query?.click_id || req.cookies?.click_id || null;
  if (!clickId) throw new Error("Missing clickId (pass as click_id in query)");

  // 2) Find the original tracking row
  const tracking = await CampaignTracking.findOne({
    where: { clickId },
    order: [["createdAt", "DESC"]],
  });
  if (!tracking) throw new Error("No campaign tracking found");

  // 3) Resolve pageUrl (referrer if not explicitly provided)
  const pageUrl = n.pageUrl || req.headers?.referer || "unknown";

  // 4) Whitelist event types (mirror PHP flexibility)
  const allowedEvents = new Set([
    "click",
    "conversion",
    "view",
    "impression",
    "",
  ]);
  const eventType = allowedEvents.has(n.eventType) ? n.eventType : "";

  // 5) Insert a PixelTracking record
  try {
    await PixelTracking.create({
      campaignId: campaign.id,
      trackingId: tracking.id,

      eventType: eventType || "conversion", // default if not provided
      transactionId: n.transactionId || null,
      clickId,

      saleAmount: n.saleAmount || null,
      conversionValue: n.saleAmount || null,
      currency: n.currency || null,
      conversionStatus: n.conversionStatus || "approved",

      pixelType: "iframe", // like your PHP pixel use
      pageUrl,
      conversionTime: new Date(),

      // Optional parity fields if you keep them in schema:
      // clickTime: new Date(),
      // clickCount: 1,
    });
  } catch (err) {
    console.error("Error inserting PixelTracking:", err);
    throw new Error("Failed to insert pixel tracking data");
  }

  return clickId;
};

/**
 * Server-to-server postback.
 * - Accept click_id, transaction_id, sale_amount/saleAmount, currency, conversionStatus, token
 * - Validate clickId and de-dupe by transactionId
 */
exports.trackPostback = async (slug, data, req) => {
  const campaign = await Campaign.findOne({ where: { trackingSlug: slug } });
  if (!campaign) throw new Error("Invalid tracking slug");

  const n = normalizeData(data);
  const clickId = n.clickId;
  if (!clickId) throw new Error("Missing clickId in postback");

  const tracking = await CampaignTracking.findOne({
    where: { clickId },
    order: [["createdAt", "DESC"]],
  });
  if (!tracking) throw new Error("No campaign tracking found");

  // Optional security: POSTBACK_TOKEN
  const suppliedToken =
    data.token || req.query?.token || req.headers["x-postback-token"];
  if (
    process.env.POSTBACK_TOKEN &&
    suppliedToken !== process.env.POSTBACK_TOKEN
  ) {
    throw new Error("Unauthorized postback");
  }

  // Duplicate protection on transactionId
  if (n.transactionId) {
    const existing = await PixelTracking.findOne({
      where: { transactionId: n.transactionId },
    });
    if (existing) throw new Error("Duplicate transaction");
  }

  await PixelTracking.create({
    campaignId: campaign.id,
    trackingId: tracking.id,

    eventType: "conversion",
    transactionId: n.transactionId || null,
    clickId,

    saleAmount: n.saleAmount || null,
    conversionValue: n.saleAmount || null,
    currency: n.currency || null,
    conversionStatus: n.conversionStatus || "approved",

    pixelType: "postback",
    pageUrl: campaign.defaultCampaignUrl || "postback",
    conversionTime: new Date(),
  });

  return clickId;
};
