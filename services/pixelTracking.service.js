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
exports.trackPostbackPhpParity = async (query) => {
  // --- PHP: $expected_token = 'SECRET123';
  const expectedToken = process.env.POSTBACK_TOKEN || "SECRET123";

  // --- PHP: read $_GET values
  const click_id = (query.click_id || "").trim();
  const txn_id = (query.txn_id || "").trim();
  const amount = query.amount != null ? parseFloat(query.amount) : 0;
  const token = query.token || "";

  // --- PHP: token check -> 403 Unauthorized
  if (token !== expectedToken) {
    const err = new Error("Unauthorized");
    err.statusCode = 403;
    throw err;
  }

  // --- PHP: required params -> 400 Missing parameters
  if (click_id === "" || txn_id === "") {
    const err = new Error("Missing parameters");
    err.statusCode = 400;
    throw err;
  }

  // --- PHP: SELECT * FROM cliksv2 WHERE click_id = ?
  // Map cliksv2 -> CampaignTracking (assuming click rows stored here)
  const clickRow = await CampaignTracking.findOne({
    where: { clickId: click_id },
    order: [["createdAt", "DESC"]],
  });

  if (!clickRow) {
    // --- PHP: 404 Invalid click_id
    const err = new Error("Invalid click_id");
    err.statusCode = 404;
    throw err;
  }

  // --- PHP: SELECT id FROM conversions_postback WHERE txn_id = ?
  const existing = await ConversionsPostback.findOne({
    where: { txnId: txn_id },
    attributes: ["id"],
  });

  if (existing) {
    // --- PHP: 409 Duplicate transaction
    const err = new Error("Duplicate transaction");
    err.statusCode = 409;
    throw err;
  }

  // --- PHP: INSERT INTO conversions_postback (click_id, txn_id, amount, created_at) ...
  // Create the row; created_at is usually auto by Sequelize timestamps,
  // but we can set it explicitly to mirror NOW().
  const now = new Date();
  await ConversionsPostback.create({
    clickId: click_id, // column name should match your model (e.g., click_id if underscored)
    txnId: txn_id, // column name should match your model (e.g., txn_id if underscored)
    amount: isNaN(amount) ? 0 : amount,
    createdAt: now, // only if your model doesn't auto-manage timestamps
    updatedAt: now, // only if needed
  });

  // If you DON'T have a ConversionsPostback model/table yet and want to reuse PixelTracking instead,
  // comment the create() above and use this:
  //
  // await PixelTracking.create({
  //   eventType: "conversion",
  //   transactionId: txn_id,
  //   clickId: click_id,
  //   saleAmount: isNaN(amount) ? 0 : amount,
  //   pixelType: "postback",
  //   pageUrl: "postback",
  //   conversionTime: new Date(),
  // });

  return true;
};
