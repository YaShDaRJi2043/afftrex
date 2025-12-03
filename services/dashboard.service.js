const { Op } = require("sequelize");
const {
  Campaign,
  CampaignTracking,
  PixelTracking,
  Advertiser,
  Publisher,
} = require("@models");

// ----------------- IST Helpers -----------------
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function istDateToUTC(dateStr, isStart = true) {
  const [y, m, d] = dateStr.split("-").map(Number);

  const hours = isStart ? 0 : 23;
  const minutes = isStart ? 0 : 59;
  const seconds = isStart ? 0 : 59;
  const ms = isStart ? 0 : 999;

  // Create IST time
  const istDate = new Date(Date.UTC(y, m - 1, d, hours, minutes, seconds, ms));

  // Convert IST → UTC
  return new Date(istDate.getTime() - IST_OFFSET_MS);
}

// Convert UTC timestamp → IST date string (YYYY-MM-DD)
function utcToISTDateKey(utcTimestamp) {
  const d = new Date(utcTimestamp.getTime() + IST_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Build IST date buckets
function buildBucketsIST(fromUTC, toUTC) {
  const buckets = new Map();

  let cur = new Date(fromUTC.getTime());
  const end = new Date(toUTC.getTime());

  while (cur <= end) {
    const key = utcToISTDateKey(cur);

    buckets.set(key, {
      date: key,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      payout: 0,
      profit: 0,
    });

    cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
  }

  return buckets;
}

// ----------------- DB Helpers -----------------
async function getCompanyCampaignIds(companyId) {
  const rows = await Campaign.findAll({
    where: { company_id: companyId },
    attributes: ["id"],
    raw: true,
  });

  return rows.map((r) => r.id);
}

// Get role-based filters: campaignIds for advertiser managers, publisherIds for publisher managers
async function getRoleFilters(companyId, user) {
  const result = { managedCampaignIds: null, managedPublisherIds: null };
  if (!user || !user.role) return result;

  const role = String(user.role).toLowerCase();

  if (role === "advertiser manager") {
    // Find advertisers managed by the user within the same company
    const advertisers = await Advertiser.findAll({
      where: { company_id: companyId, manager_id: user.id },
      attributes: ["id"],
      raw: true,
    });

    const advertiserIds = advertisers.map((a) => a.id);
    if (advertiserIds.length) {
      const campaigns = await Campaign.findAll({
        where: {
          company_id: companyId,
          advertiser_id: { [Op.in]: advertiserIds },
        },
        attributes: ["id"],
        raw: true,
      });

      result.managedCampaignIds = campaigns.map((c) => c.id);
    } else {
      result.managedCampaignIds = [];
    }
  } else if (role === "publisher manager") {
    // Find publishers managed by the user within the same company
    const publishers = await Publisher.findAll({
      where: { company_id: companyId, manager_id: user.id },
      attributes: ["id"],
      raw: true,
    });
    result.managedPublisherIds = publishers.map((p) => p.id);
  }

  return result;
}

// ----------------- Build Series -----------------
async function getSeries(companyId, fromUTC, toUTC, user) {
  const campaignIds = await getCompanyCampaignIds(companyId);
  if (!campaignIds.length) return [];

  const buckets = buildBucketsIST(fromUTC, toUTC);

  // Role filters
  const { managedCampaignIds, managedPublisherIds } = await getRoleFilters(
    companyId,
    user
  );

  // Clicks
  const clickWhere = {
    campaignId: { [Op.in]: campaignIds },
    timestamp: { [Op.between]: [fromUTC, toUTC] },
  };
  // If advertiser manager, restrict to managed campaigns
  if (managedCampaignIds) {
    clickWhere.campaignId = { [Op.in]: managedCampaignIds };
  }
  // If publisher manager, restrict to managed publishers
  if (managedPublisherIds) {
    clickWhere.publisherId = { [Op.in]: managedPublisherIds };
  }

  const clicks = await CampaignTracking.findAll({
    attributes: ["timestamp"],
    where: clickWhere,
    raw: true,
  });

  for (const row of clicks) {
    const key = utcToISTDateKey(new Date(row.timestamp));
    const b = buckets.get(key);
    if (b) b.clicks += 1;
  }

  // Conversions
  const convWhere = {
    campaignId: { [Op.in]: campaignIds },
    conversionTime: { [Op.between]: [fromUTC, toUTC] },
  };
  if (managedCampaignIds) {
    convWhere.campaignId = { [Op.in]: managedCampaignIds };
  }
  if (managedPublisherIds) {
    convWhere.publisherId = { [Op.in]: managedPublisherIds };
  }

  const conversions = await PixelTracking.findAll({
    attributes: ["conversionTime", "revenue", "payout", "profit"],
    where: convWhere,
    raw: true,
  });

  for (const row of conversions) {
    const key = utcToISTDateKey(new Date(row.conversionTime));
    const b = buckets.get(key);

    if (b) {
      b.conversions += 1;

      const rev = Number(row.revenue) || 0;
      const pay = Number(row.payout) || 0;
      const profit = Number(row.profit) || rev - pay;

      b.revenue += rev;
      b.payout += pay;
      b.profit += profit;
    }
  }

  return Array.from(buckets.values());
}

// ----------------- Tiles (Today / Yesterday / MTD) -----------------
async function getTiles(companyId, user) {
  const campaignIds = await getCompanyCampaignIds(companyId);
  if (!campaignIds.length) {
    return {
      clicks: { today: 0, yesterday: 0, mtd: 0 },
      conversions: { today: 0, yesterday: 0, mtd: 0 },
    };
  }

  // Role filters
  const { managedCampaignIds, managedPublisherIds } = await getRoleFilters(
    companyId,
    user
  );

  // Get IST "today"
  const nowUTC = new Date();
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET_MS);

  const y = nowIST.getUTCFullYear();
  const m = nowIST.getUTCMonth();
  const d = nowIST.getUTCDate();

  const todayStartUTC = istDateToUTC(`${y}-${m + 1}-${d}`, true);
  const todayEndUTC = istDateToUTC(`${y}-${m + 1}-${d}`, false);

  const yesterday = new Date(todayStartUTC.getTime() - 24 * 60 * 60 * 1000);
  const yKey = utcToISTDateKey(yesterday);
  const [yy, ym, yd] = yKey.split("-");

  const yStartUTC = istDateToUTC(`${yy}-${ym}-${yd}`, true);
  const yEndUTC = istDateToUTC(`${yy}-${ym}-${yd}`, false);

  const mStartUTC = istDateToUTC(`${y}-${m + 1}-01`, true);
  const mEndUTC = nowUTC;

  let base = { campaignId: { [Op.in]: campaignIds } };
  if (managedCampaignIds) {
    base = { campaignId: { [Op.in]: managedCampaignIds } };
  }
  // For publisher manager, clicks should be restricted by publisherId
  let clickBase = { ...base };
  if (managedPublisherIds) {
    clickBase.publisherId = { [Op.in]: managedPublisherIds };
  }

  // Clicks
  const [tClick, yClick, mClick] = await Promise.all([
    CampaignTracking.count({
      where: {
        ...clickBase,
        timestamp: { [Op.between]: [todayStartUTC, todayEndUTC] },
      },
    }),
    CampaignTracking.count({
      where: {
        ...clickBase,
        timestamp: { [Op.between]: [yStartUTC, yEndUTC] },
      },
    }),
    CampaignTracking.count({
      where: {
        ...clickBase,
        timestamp: { [Op.between]: [mStartUTC, mEndUTC] },
      },
    }),
  ]);

  // Conversions
  // For publisher manager, conversions should be restricted by publisherId on pixel trackings
  const convBase = managedPublisherIds
    ? { ...base, publisherId: { [Op.in]: managedPublisherIds } }
    : { ...base };
  const [tConv, yConv, mConv] = await Promise.all([
    PixelTracking.count({
      where: {
        ...convBase,
        conversionTime: { [Op.between]: [todayStartUTC, todayEndUTC] },
      },
    }),
    PixelTracking.count({
      where: {
        ...convBase,
        conversionTime: { [Op.between]: [yStartUTC, yEndUTC] },
      },
    }),
    PixelTracking.count({
      where: {
        ...convBase,
        conversionTime: { [Op.between]: [mStartUTC, mEndUTC] },
      },
    }),
  ]);

  return {
    clicks: { today: tClick, yesterday: yClick, mtd: mClick },
    conversions: { today: tConv, yesterday: yConv, mtd: mConv },
  };
}

// ----------------- MAIN -----------------
exports.getDashboard = async ({ company_id, from, to, user }) => {
  if (!company_id) {
    const err = new Error("companyId is required");
    err.statusCode = 400;
    throw err;
  }

  // Default 7 days (IST)
  const nowUTC = new Date();
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET_MS);

  const y = nowIST.getUTCFullYear();
  const m = nowIST.getUTCMonth();
  const d = nowIST.getUTCDate();

  const defaultToUTC = istDateToUTC(`${y}-${m + 1}-${d}`, false);
  const defaultFromUTC = new Date(
    defaultToUTC.getTime() - 6 * 24 * 60 * 60 * 1000
  );

  // Final date filters
  const fromUTC = from ? istDateToUTC(from, true) : defaultFromUTC;
  const toUTC = to ? istDateToUTC(to, false) : defaultToUTC;

  const [series, tiles] = await Promise.all([
    getSeries(company_id, fromUTC, toUTC, user),
    getTiles(company_id, user),
  ]);

  return [
    ...series,
    { clicks: tiles.clicks },
    { conversions: tiles.conversions },
  ];
};
