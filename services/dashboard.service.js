const { Op } = require("sequelize");
const { Campaign, CampaignTracking, PixelTracking } = require("@models");

// ----------------- Utility functions -----------------
function toISODate(d) {
  return new Date(d).toISOString().slice(0, 10);
}
function addDays(d, n) {
  const x = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}
function startOfDayUTC(d) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  );
}
function endOfDayUTC(d) {
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
}
function buildBuckets(from, to) {
  const buckets = new Map();
  let cur = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  );
  const end = new Date(
    Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate())
  );
  while (cur <= end) {
    const key = toISODate(cur);
    // Initialize daily buckets including financial metrics
    buckets.set(key, {
      date: key,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      payout: 0,
      profit: 0,
    });
    cur = addDays(cur, 1);
  }
  return buckets;
}
function dateKeyUTC(created_at) {
  const d = new Date(created_at);
  return toISODate(
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  );
}

// ----------------- Helpers -----------------
async function getCompanyCampaignIds(companyId) {
  const rows = await Campaign.findAll({
    where: { company_id: companyId },
    attributes: ["id"],
    raw: true,
  });
  return rows.map((r) => r.id);
}

async function getSeries(companyId, from, to) {
  const campaignIds = await getCompanyCampaignIds(companyId);
  if (!campaignIds.length) return [];

  const buckets = buildBuckets(from, to);

  // Clicks (CampaignTracking)
  const clickRows = await CampaignTracking.findAll({
    attributes: ["id", "created_at"],
    where: {
      campaignId: { [Op.in]: campaignIds },
      created_at: { [Op.between]: [startOfDayUTC(from), endOfDayUTC(to)] },
    },
    raw: true,
  });

  for (const row of clickRows) {
    const key = dateKeyUTC(row.created_at);
    const b = buckets.get(key);
    if (b) b.clicks += 1;
  }

  // Conversions (PixelTracking)
  const convRows = await PixelTracking.findAll({
    attributes: [
      "id",
      "created_at",
      "event_type",
      "revenue",
      "payout",
      "profit",
    ],
    where: {
      campaignId: { [Op.in]: campaignIds },
      event_type: "conversion",
      created_at: { [Op.between]: [startOfDayUTC(from), endOfDayUTC(to)] },
    },
    raw: true,
  });

  for (const row of convRows) {
    const key = dateKeyUTC(row.created_at);
    const b = buckets.get(key);
    if (b) {
      b.conversions += 1;
      // Sum up financials, ensuring numeric conversion (DECIMAL may come as string)
      const rev = Number(row.revenue) || 0;
      const pay = Number(row.payout) || 0;
      const prof = Number(row.profit) || rev - pay; // fallback if not stored
      b.revenue += rev;
      b.payout += pay;
      b.profit += prof;
    }
  }

  return Array.from(buckets.values());
}

async function getTiles(companyId) {
  const campaignIds = await getCompanyCampaignIds(companyId);
  if (!campaignIds.length) {
    return {
      clicks: { today: 0, yesterday: 0, mtd: 0 },
      conversions: { today: 0, yesterday: 0, mtd: 0 },
    };
  }

  const now = new Date();
  const todayStart = startOfDayUTC(now);
  const todayEnd = endOfDayUTC(now);
  const yStart = startOfDayUTC(addDays(todayStart, -1));
  const yEnd = endOfDayUTC(addDays(todayStart, -1));
  const mStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
  );
  const mEnd = now;

  const base = { campaignId: { [Op.in]: campaignIds } };

  // Clicks
  const [clicksToday, clicksYesterday, clicksMTD] = await Promise.all([
    CampaignTracking.count({
      where: { ...base, created_at: { [Op.between]: [todayStart, todayEnd] } },
    }),
    CampaignTracking.count({
      where: { ...base, created_at: { [Op.between]: [yStart, yEnd] } },
    }),
    CampaignTracking.count({
      where: { ...base, created_at: { [Op.between]: [mStart, mEnd] } },
    }),
  ]);

  // Conversions
  const convBase = { ...base, event_type: "conversion" };
  const [convToday, convYesterday, convMTD] = await Promise.all([
    PixelTracking.count({
      where: {
        ...convBase,
        created_at: { [Op.between]: [todayStart, todayEnd] },
      },
    }),
    PixelTracking.count({
      where: { ...convBase, created_at: { [Op.between]: [yStart, yEnd] } },
    }),
    PixelTracking.count({
      where: { ...convBase, created_at: { [Op.between]: [mStart, mEnd] } },
    }),
  ]);

  return {
    clicks: { today: clicksToday, yesterday: clicksYesterday, mtd: clicksMTD },
    conversions: { today: convToday, yesterday: convYesterday, mtd: convMTD },
  };
}

// ----------------- Main Service -----------------
exports.getDashboard = async ({ company_id, from, to }) => {
  if (!company_id) {
    const err = new Error("companyId is required");
    err.statusCode = 400;
    throw err;
  }

  const today = new Date();
  const defTo = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const defFrom = addDays(defTo, -6);

  const fromDate = from ? new Date(from) : defFrom;
  const toDate = to ? new Date(to) : defTo;

  const [series, tiles] = await Promise.all([
    getSeries(company_id, fromDate, toDate),
    getTiles(company_id),
  ]);

  // Return series directly in data and include clicks/conversions objects at the end
  return [
    ...series,
    { clicks: tiles.clicks },
    { conversions: tiles.conversions },
  ];
};
