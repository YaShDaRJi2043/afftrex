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
// services/pixelTracking.service.js

// helper: first non-empty among possible keys
function firstNonEmpty(obj, ...keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "")
      return String(v).trim();
  }
  return "";
}

exports.trackPostbackPhpParity = async (req = {}) => {
  console.log(
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    req.query
  );

  const q = req.query || {};
  const headers = req.headers || {};

  // PHP had a hardcoded SECRET; use env if set, else fallback
  const expectedToken =
    process.env.POSTBACK_TOKEN ||
    "b9efc4ceefb3d63991cf334ef9ce96548743cd51c9bbfdd0e5042c3020b16bd8";

  // ACCEPT BOTH names like PHP+your current links: token OR security_token (or header)
  const suppliedToken =
    firstNonEmpty(q, "security_token", "token") ||
    headers["x-postback-token"] ||
    "";

  // === Token check (PHP: 403 Unauthorized)
  if (suppliedToken !== expectedToken) {
    const err = new Error("Unauthorized");
    err.statusCode = 403;
    throw err;
  }

  // === Read params exactly like PHP (but allow common aliases)
  const click_id = firstNonEmpty(
    q,
    "click_id",
    "aff_sub1",
    "sub1",
    "af_click_id",
    "clickId"
  );
  const txn_id = firstNonEmpty(
    q,
    "txn_id",
    "transaction_id",
    "order_id",
    "conv_id",
    "transactionId"
  );
  const amountS = firstNonEmpty(
    q,
    "amount",
    "saleAmount",
    "revenue",
    "value",
    "payout"
  );
  const amount = amountS ? parseFloat(amountS) : 0;

  // === Required params (PHP: 400 Missing parameters)
  if (!click_id || !txn_id) {
    const err = new Error("Missing parameters");
    err.statusCode = 400;
    throw err;
  }

  // === Check click_id existence (PHP: 404 Invalid click_id)
  const clickRow = await CampaignTracking.findOne({
    where: { clickId: click_id },
    order: [["createdAt", "DESC"]],
  });
  if (!clickRow) {
    const err = new Error("Invalid click_id");
    err.statusCode = 404;
    throw err;
  }

  // === Duplicate txn_id (PHP: 409 Duplicate transaction)
  const existing = await PixelTracking.findOne({
    where: { txnId: txn_id },
    attributes: ["id"],
  });
  if (existing) {
    const err = new Error("Duplicate transaction");
    err.statusCode = 409;
    throw err;
  }

  // === Insert conversion (PHP: INSERT INTO conversions_postback ...)
  const now = new Date();
  try {
    await PixelTracking.create({
      campaignId: clickRow.campaignId,
      trackingId: clickRow.id,

      eventType: "conversion", // default for postback
      transactionId: txn_id,
      clickId: click_id,

      saleAmount: amount ? 0 : amount,
      conversionValue: amount ? 0 : amount,
      currency: firstNonEmpty(q, "currency") || null,
      conversionStatus: firstNonEmpty(q, "conversionStatus") || "approved",

      pixelType: "postback", // differentiate from iframe
      pageUrl: null, // no pageUrl in postback
      conversionTime: now,

      // Added clickCount (default 0 for postback)
      clickCount: 0,
    });
  } catch (err) {
    console.error("Error inserting PixelTracking:", err);
    throw new Error("Failed to insert pixel tracking data");
  }

  return true;
};

// Optional: keep old signature working
exports.trackPostback = async (_slug, data, req) => {
  // ignore slug; PHP parity uses only query
  // if someone passes (data) only, synthesize a req:
  const fauxReq = req || { query: data, headers: {} };
  return exports.trackPostbackPhpParity(fauxReq);
};
