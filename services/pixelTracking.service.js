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

  // 5) Count how many times this user clicked (IP + UA)
  const sameUserClicks = await CampaignTracking.count({
    where: {
      campaignId: campaign.id,
      ipAddress: tracking.ipAddress,
      userAgent: tracking.userAgent,
      eventType: "click",
    },
  });

  // 6) Insert a PixelTracking record
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

      // Added clickCount
      clickCount: sameUserClicks,
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
// services/pixelTracking.service.js
exports.trackPostbackPhpParity = async (req) => {
  const expectedToken =
    "b9efc4ceefb3d63991cf334ef9ce96548743cd51c9bbfdd0e5042c3020b16bd8";
  const suppliedToken = req.query?.security_token || "";

  const click_id = (
    req.query?.click_id ||
    req.cookies?.click_id ||
    null
  ).trim();
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@", req.query);

  const txn_id = (req.query?.txn_id || "").trim();
  const amount = req.query?.amount != null ? parseFloat(req.query?.amount) : 0;

  if (suppliedToken !== expectedToken) {
    const err = new Error("Unauthorized");
    err.statusCode = 403;
    throw err;
  }
  if (click_id === "") {
    const err = new Error("Missing parameters");
    err.statusCode = 400;
    throw err;
  }

  const clickRow = await CampaignTracking.findOne({
    where: { clickId: click_id },
    order: [["createdAt", "DESC"]],
  });
  if (!clickRow) {
    const err = new Error("Invalid click_id");
    err.statusCode = 404;
    throw err;
  }

  const existing = await PixelTracking.findOne({
    where: { txnId: txn_id },
    attributes: ["id"],
  });
  if (existing) {
    const err = new Error("Duplicate transaction");
    err.statusCode = 409;
    throw err;
  }

  const now = new Date();
  await PixelTracking.create({
    clickId: click_id,
    txnId: txn_id,
    amount: isNaN(amount) ? 0 : amount,
    createdAt: now,
    updatedAt: now,
  });

  return true;
};
