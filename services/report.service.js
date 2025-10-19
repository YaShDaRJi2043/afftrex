const {
  CampaignTracking,
  PixelTracking,
  Publisher,
  Advertiser,
  Campaign,
  sequelize,
} = require("@models");
const { Op } = require("sequelize");

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5:30 in milliseconds

// Helper: convert IST date string to UTC Date for DB filtering
function istDateToUTC(startOrEnd, isStart = true) {
  const [year, month, day] = startOrEnd.split("-").map(Number);
  const hours = isStart ? 0 : 23;
  const minutes = isStart ? 0 : 59;
  const seconds = isStart ? 0 : 59;
  const ms = isStart ? 0 : 999;

  // Create local IST date
  const istDate = new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds, ms)
  );
  // Subtract IST offset to get UTC equivalent
  return new Date(istDate.getTime() - IST_OFFSET_MS);
}

exports.getCampaignTrackingByCampaignId = async (req) => {
  try {
    const {
      campaignId,
      publisherId,
      advertiserId,
      page = 1,
      pageSize = 10,
      startDate,
      endDate,
    } = req.query;
    const { company } = req.user;

    const limit = Number.parseInt(pageSize, 10);
    const offset = (Number.parseInt(page, 10) - 1) * limit;

    const options = {
      include: [
        { model: Publisher, as: "publisher", attributes: ["id", "name"] },
        { model: Advertiser, as: "advertiser", attributes: ["id", "name"] },
        {
          model: Campaign,
          as: "campaign",
          attributes: ["id", "title", "company_id"],
          where: { company_id: company.id },
        },
      ],
      limit,
      offset,
      where: {},
    };

    if (campaignId) options.where.campaignId = campaignId;
    if (publisherId) options.where.publisherId = publisherId;
    if (advertiserId) options.where.advertiserId = advertiserId;

    // ✅ IST date filter
    if (startDate && endDate) {
      options.where.timestamp = {
        [Op.between]: [
          istDateToUTC(startDate, true),
          istDateToUTC(endDate, false),
        ],
      };
    } else if (startDate) {
      options.where.timestamp = { [Op.gte]: istDateToUTC(startDate, true) };
    } else if (endDate) {
      options.where.timestamp = { [Op.lte]: istDateToUTC(endDate, false) };
    }

    const [trackings, total] = await Promise.all([
      CampaignTracking.findAll(options),
      CampaignTracking.count({
        where: options.where,
        include: options.include,
        distinct: true,
      }),
    ]);

    return { total, trackings };
  } catch (error) {
    console.error("Error in getCampaignTrackingByCampaignId:", error);
    throw new Error(`Failed to get campaign tracking data: ${error.message}`);
  }
};

exports.getPixelTrackingByTrackingId = async (req) => {
  const {
    campaignId,
    publisherId,
    advertiserId,
    startDate,
    endDate,
    page = 1,
    pageSize = 10,
  } = req.query;
  const { company } = req.user;

  const limit = Number.parseInt(pageSize, 10);
  const offset = (Number.parseInt(page, 10) - 1) * limit;

  const options = {
    limit,
    offset,
    include: [
      {
        model: Publisher,
        as: "publisher",
        attributes: ["id", "name"],
        required: false,
      },
      {
        model: Advertiser,
        as: "advertiser",
        attributes: ["id", "name"],
        required: false,
      },
      {
        model: CampaignTracking,
        as: "campaignTracking",
        attributes: ["id", "campaignId"],
        required: true,
        include: [
          {
            model: Campaign,
            as: "campaign",
            attributes: ["id", "title", "company_id"],
            where: { company_id: company.id },
            required: true,
          },
        ],
      },
    ],
    where: {},
  };

  if (campaignId) options.where.campaignId = campaignId;
  if (publisherId) options.where.publisherId = publisherId;
  if (advertiserId) options.where.advertiserId = advertiserId;

  // ✅ IST date filter for conversionTime
  if (startDate && endDate) {
    options.where.conversionTime = {
      [Op.between]: [
        istDateToUTC(startDate, true),
        istDateToUTC(endDate, false),
      ],
    };
  } else if (startDate) {
    options.where.conversionTime = { [Op.gte]: istDateToUTC(startDate, true) };
  } else if (endDate) {
    options.where.conversionTime = { [Op.lte]: istDateToUTC(endDate, false) };
  }

  const [pixelTrackings, total] = await Promise.all([
    PixelTracking.findAll(options),
    PixelTracking.count({
      where: options.where,
      include: options.include,
      distinct: true,
    }),
  ]);

  return { pixelTrackings, total };
};

const groupByMap = {
  campaign: "c.title",
  campaignId: "c.id",
  campaignUniqueId: "c.unique_id",
  campaignStatus: `c."campaignStatus"`,
  campaignGeoCoverage: `CAST(c."geoCoverage" AS TEXT)`,
  campaignAppName: `c."appName"`,
  publisher: "pub.name",
  publisherId: "pub.id",
  publisherManager: "pub.managers",
  advertiser: "adv.name",
  advertiserId: "adv.id",
  advertiserManager: "adv.managers",
  device: "ct.device",
  os: "ct.os",
  country: "ct.country",
  year: `TO_CHAR(ct.timestamp, 'YYYY')`,
  month: `TO_CHAR(ct.timestamp, 'Mon')`,
  week: `TO_CHAR(DATE_TRUNC('week', ct.timestamp), 'DD-MM-YYYY') || ' to ' || TO_CHAR(DATE_TRUNC('week', ct.timestamp) + INTERVAL '6 days', 'DD-MM-YYYY')`,
  day: `TO_CHAR(ct.timestamp, 'DD-MM-YYYY')`,
};

exports.getMainReport = async (req) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      groupBy = "",
      startDate,
      endDate,
      campaign,
      publisher,
      advertiser,
    } = req.query;
    const { company } = req.user;

    const limit = Number.parseInt(pageSize, 10);
    const offset = (Number.parseInt(page, 10) - 1) * limit;

    const groupKeys = groupBy
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    if (!groupKeys.length)
      throw new Error("Please provide at least one groupBy field");

    const groupColumns = groupKeys.map((k) => groupByMap[k]).filter(Boolean);
    if (!groupColumns.length) throw new Error("Invalid groupBy field(s)");

    let idColumns = [];
    if (groupKeys.includes("campaign")) idColumns.push(`c.id AS "campaignId"`);
    if (groupKeys.includes("publisher"))
      idColumns.push(`pub.id AS "publisherId"`);
    if (groupKeys.includes("advertiser"))
      idColumns.push(`adv.id AS "advertiserId"`);

    // ✅ Updated selectColumns: same as your old code
    const selectColumns = [
      ...groupColumns.map((col, index) => {
        const key = groupKeys[index];
        if (["day", "month", "year", "week"].includes(key)) {
          return `${col} AS "${key.charAt(0).toUpperCase() + key.slice(1)}"`;
        }
        return `${col} AS "${key}"`;
      }),
      ...idColumns,
    ].join(", ");

    // ✅ Updated groupClause: use expressions, not aliases
    const groupClauseExpressions = groupKeys
      .map((k) => groupByMap[k])
      .filter(Boolean);

    const groupClauseArray = [...groupClauseExpressions];
    if (idColumns.length) {
      groupClauseArray.push(...idColumns.map((col) => col.split(" AS")[0]));
    }
    const groupClauseSQL = groupClauseArray.join(", ");

    let filters = "WHERE 1=1";
    const replacements = { limit, offset };

    if (company?.id) {
      filters += " AND c.company_id = :companyId";
      replacements.companyId = company.id;
    }

    // ✅ IST date filter
    if (startDate && endDate) {
      filters += ` AND ct.timestamp BETWEEN :startDate AND :endDate`;
      replacements.startDate = istDateToUTC(startDate, true).toISOString();
      replacements.endDate = istDateToUTC(endDate, false).toISOString();
    } else if (startDate) {
      filters += ` AND ct.timestamp >= :startDate`;
      replacements.startDate = istDateToUTC(startDate, true).toISOString();
    } else if (endDate) {
      filters += ` AND ct.timestamp <= :endDate`;
      replacements.endDate = istDateToUTC(endDate, false).toISOString();
    }

    if (campaign) {
      const campaignArray = Array.isArray(campaign)
        ? campaign
        : campaign.split(",").map((id) => id.trim());
      filters += ` AND c.id IN (:campaignArray)`;
      replacements.campaignArray = campaignArray;
    }

    if (publisher) {
      const publisherArray = Array.isArray(publisher)
        ? publisher
        : publisher.split(",").map((id) => id.trim());
      filters += ` AND pub.id IN (:publisherArray)`;
      replacements.publisherArray = publisherArray;
    }

    if (advertiser) {
      const advertiserArray = Array.isArray(advertiser)
        ? advertiser
        : advertiser.split(",").map((id) => id.trim());
      filters += ` AND adv.id IN (:advertiserArray)`;
      replacements.advertiserArray = advertiserArray;
    }

    const results = await sequelize.query(
      `
      SELECT 
        ${selectColumns},
        COUNT(DISTINCT ct.id) AS "grossClicks",
        COUNT(DISTINCT pt.id) AS "totalConversions",
        COALESCE(SUM(pt.revenue), 0) AS "totalRevenue",
        COALESCE(SUM(pt.payout), 0) AS "totalPayout",
        COALESCE(SUM(pt.profit), 0) AS "totalProfit"
      FROM campaigns c
      LEFT JOIN advertisers adv ON adv.id = c.advertiser_id
      LEFT JOIN campaign_trackings ct ON ct.campaign_id = c.id
      LEFT JOIN publishers pub ON pub.id = ct.publisher_id
      LEFT JOIN pixel_tracking pt ON pt.tracking_id = ct.id
      ${filters}
      GROUP BY ${groupClauseSQL}
      ORDER BY ${groupClauseSQL}
      LIMIT :limit OFFSET :offset
      `,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    const totalRecordsQuery = await sequelize.query(
      `
      SELECT COUNT(*) AS count FROM (
        SELECT ${groupClauseExpressions.join(", ")}
        FROM campaigns c
        LEFT JOIN advertisers adv ON adv.id = c.advertiser_id
        LEFT JOIN campaign_trackings ct ON ct.campaign_id = c.id
        LEFT JOIN publishers pub ON pub.id = ct.publisher_id
        LEFT JOIN pixel_tracking pt ON pt.tracking_id = ct.id
        ${filters}
        GROUP BY ${groupClauseExpressions.join(", ")}
      ) sub
      `,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    return {
      total: Number.parseInt(totalRecordsQuery[0].count, 10),
      data: results,
    };
  } catch (err) {
    console.error("TrackingService.getMainReport error:", err);
    throw new Error(`Failed to generate main report: ${err.message}`);
  }
};
