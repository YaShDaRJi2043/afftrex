const {
  CampaignTracking,
  PixelTracking,
  Publisher,
  sequelize,
} = require("@models");

exports.getCampaignTrackingByCampaignId = async (req) => {
  const { campaignId, page = 1, pageSize = 10 } = req.query; // Retrieve campaignId from query

  const options = {
    include: [
      {
        model: Publisher,
        as: "publisher",
        attributes: ["id", "name"],
      },
    ],
    limit: parseInt(pageSize),
    offset: (parseInt(page) - 1) * parseInt(pageSize),
  };

  if (campaignId) {
    options.where = { campaignId };
  }

  const [trackings, total] = await Promise.all([
    CampaignTracking.findAll(options),
    CampaignTracking.count(options.where ? { where: options.where } : {}),
  ]);

  return { trackings, total };
};

exports.getPixelTrackingByTrackingId = async (req) => {
  const { campaignId, page = 1, pageSize = 10 } = req.query; // Retrieve campaignId from query

  const options = {
    limit: parseInt(pageSize),
    offset: (parseInt(page) - 1) * parseInt(pageSize),
  };

  if (campaignId) {
    options.where = { campaignId };
  }

  const [pixelTrackings, total] = await Promise.all([
    PixelTracking.findAll(options),
    PixelTracking.count(options.where ? { where: options.where } : {}),
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
      campaign, // can be single ID or array
      publisher, // can be single ID or array
      advertiser, // can be single ID or array
    } = req.query;

    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    // ---------------- Prepare groupBy columns ----------------
    const groupKeys = groupBy
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    if (!groupKeys.length) {
      throw new Error("Please provide at least one groupBy field");
    }

    const groupColumns = groupKeys.map((k) => groupByMap[k]).filter(Boolean);
    if (!groupColumns.length) {
      throw new Error("Invalid groupBy field(s)");
    }

    const selectColumns = groupColumns
      .map((col, index) => {
        const key = groupKeys[index];
        if (["day", "month", "year", "week"].includes(key)) {
          return `${col} AS "${key.charAt(0).toUpperCase() + key.slice(1)}"`;
        }
        return `${col} AS "${key}"`;
      })
      .join(", ");

    const groupClause = groupColumns.join(", ");

    // ---------------- Filters ----------------
    let filters = "WHERE 1=1";
    const replacements = { limit, offset };

    // Date filters
    if (startDate && endDate) {
      filters += ` AND ct.timestamp BETWEEN :startDate AND :endDate`;
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    } else if (startDate) {
      filters += ` AND ct.timestamp >= :startDate`;
      replacements.startDate = startDate;
    } else if (endDate) {
      filters += ` AND ct.timestamp <= :endDate`;
      replacements.endDate = endDate;
    }

    // Campaign filter (supports single or multiple)
    if (campaign) {
      const campaignArray = Array.isArray(campaign)
        ? campaign
        : campaign.split(",").map((id) => id.trim());
      filters += ` AND c.id IN (:campaignArray)`;
      replacements.campaignArray = campaignArray;
    }

    // Publisher filter (supports single or multiple)
    if (publisher) {
      const publisherArray = Array.isArray(publisher)
        ? publisher
        : publisher.split(",").map((id) => id.trim());
      filters += ` AND pub.id IN (:publisherArray)`;
      replacements.publisherArray = publisherArray;
    }

    // Advertiser filter (supports single or multiple)
    if (advertiser) {
      const advertiserArray = Array.isArray(advertiser)
        ? advertiser
        : advertiser.split(",").map((id) => id.trim());
      filters += ` AND adv.id IN (:advertiserArray)`;
      replacements.advertiserArray = advertiserArray;
    }

    // ---------------- Main Query ----------------
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
        GROUP BY ${groupClause}
        ORDER BY ${groupClause}
        LIMIT :limit OFFSET :offset
      `,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // ---------------- Count Query ----------------
    const totalRecordsQuery = await sequelize.query(
      `
        SELECT COUNT(*) AS count FROM (
          SELECT ${groupClause}
          FROM campaigns c
          LEFT JOIN advertisers adv ON adv.id = c.advertiser_id
          LEFT JOIN campaign_trackings ct ON ct.campaign_id = c.id
          LEFT JOIN publishers pub ON pub.id = ct.publisher_id
          LEFT JOIN pixel_tracking pt ON pt.tracking_id = ct.id
          ${filters}
          GROUP BY ${groupClause}
        ) sub
      `,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const total = parseInt(totalRecordsQuery[0].count, 10);

    return {
      total,
      data: results,
    };
  } catch (err) {
    console.error("TrackingService.getMainReport error:", err);
    throw new Error(`Failed to generate main report: ${err.message}`);
  }
};
