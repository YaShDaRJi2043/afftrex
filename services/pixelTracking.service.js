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

// === Helper to clean saleAmount strings like INR5000, ₹5000, INR 5000 ===
function parseNumericAmount(value) {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const numeric = value.replace(/[^0-9.]/g, ""); // strip everything except digits and dot
    return numeric ? parseFloat(numeric) : 0;
  }
  return 0;
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
  console.log("trackPixel: clickId =", clickId);
  if (!clickId) throw new Error("Missing clickId (pass as click_id in query)");

  // 2) Find the original tracking row
  const tracking = await CampaignTracking.findOne({
    where: { clickId },
    order: [["createdAt", "DESC"]],
  });
  console.log("trackPixel: tracking =", tracking);
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

  // === Added revenue/payout calculation ===
  let revenue = 0;
  let payout = 0;
  const numericSaleAmount = parseNumericAmount(n.saleAmount);

  if (campaign.objective === "conversions") {
    revenue = campaign.revenue || 0;
    payout = campaign.payout || 0;
  } else if (campaign.objective === "sale") {
    revenue = ((campaign.revenue || 0) / 100) * numericSaleAmount;
    payout = ((campaign.payout || 0) / 100) * numericSaleAmount;
  }

  // === Added profit calculation ===
  const profit = revenue - payout;

  // 6) Insert a PixelTracking record
  try {
    await PixelTracking.create({
      campaignId: campaign.id,
      trackingId: tracking.id,
      publisherId: tracking.publisherId || null,
      advertiserId: tracking.advertiserId || null,

      eventType: eventType || "conversion", // default if not provided
      transactionId: n.transactionId || null,
      clickId,

      saleAmount: n.saleAmount || 0,
      conversionValue: n.saleAmount || 0,
      currency: n.currency || null,
      conversionStatus: n.conversionStatus || "approved",

      pixelType: "iframe", // like your PHP pixel use
      pageUrl,
      conversionTime: new Date(),

      // Added clickCount
      clickCount: sameUserClicks,

      // === Added fields ===
      revenue,
      payout,
      profit,
    });
  } catch (err) {
    console.error("Error inserting PixelTracking:", err);
    throw new Error("Failed to insert pixel tracking data");
  }

  return clickId;
};

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

exports.trackPostback = async (req = {}) => {
  const q = req.query || {};
  const headers = req.headers || {};

  const suppliedToken =
    firstNonEmpty(q, "security_token", "token") ||
    headers["x-postback-token"] ||
    "";

  const campaign = await Campaign.findOne({
    where: { security_token: req.query.security_token },
  });
  console.log("campaign postback", campaign);
  if (!campaign) throw new Error("Invalid security token");
  const expectedToken = campaign.security_token;

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
  console.log("transaction_id:", txn_id);

  const amountS = firstNonEmpty(
    q,
    "amount",
    "saleAmount",
    "revenue",
    "value",
    "payout"
  );
  const amount = parseNumericAmount(amountS);
  console.log("postback click_id:", click_id);

  // === Required params
  if (!click_id) {
    const err = new Error("Missing parameters");
    err.statusCode = 400;
    throw err;
  }

  // === Check click_id existence
  const clickRow = await CampaignTracking.findOne({
    where: { clickId: click_id },
    order: [["createdAt", "DESC"]],
  });
  if (!clickRow) {
    const err = new Error("Invalid click_id");
    err.statusCode = 404;
    throw err;
  }

  // === Duplicate transactionId
  const existing = await PixelTracking.findOne({
    where: { transactionId: txn_id, pixelType: "postback" },
    attributes: ["id"],
  });
  if (existing) {
    const err = new Error("Duplicate transaction");
    err.statusCode = 409;
    throw err;
  }

  const sameUserClicks = await CampaignTracking.count({
    where: {
      campaignId: campaign.id,
      ipAddress: clickRow.ipAddress,
      userAgent: clickRow.userAgent,
      eventType: "click",
    },
  });

  // === Added revenue/payout calculation ===
  let revenue = 0;
  let payout = 0;
  if (campaign.objective === "conversions") {
    revenue = campaign.revenue || 0;
    payout = campaign.payout || 0;
  } else if (campaign.objective === "sale") {
    revenue = ((campaign.revenue || 0) / 100) * amount;
    payout = ((campaign.payout || 0) / 100) * amount;
  }

  // === Added profit calculation ===
  const profit = revenue - payout;

  // === Insert conversion
  const now = new Date();
  try {
    await PixelTracking.create({
      campaignId: clickRow.campaignId,
      trackingId: clickRow.id,
      publisherId: clickRow.publisherId || null,
      advertiserId: clickRow.advertiserId || null,

      eventType: "conversion",
      transactionId: txn_id,
      clickId: click_id,

      saleAmount: amount || 0,
      conversionValue: amount || 0,
      currency: firstNonEmpty(q, "currency") || null,
      conversionStatus: firstNonEmpty(q, "conversionStatus") || "approved",

      pixelType: "postback",
      pageUrl: campaign.defaultCampaignUrl || null,
      conversionTime: now,

      // Added clickCount (default 0 for postback)
      clickCount: sameUserClicks || 0,

      // === Added fields ===
      revenue,
      payout,
      profit,
    });
  } catch (err) {
    console.error("Error inserting PixelTracking:", err);
    throw new Error("Failed to insert pixel tracking data");
  }

  return true;
};
