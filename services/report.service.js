const {
  CampaignTracking,
  PixelTracking,
  Publisher,
  Campaign,
  sequelize,
} = require("@models");
const { Op } = require("sequelize");

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
    const { company } = req.user; // Only use company for filtering

    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const options = {
      include: [
        {
          model: Publisher,
          as: "publisher",
          attributes: ["id", "name"],
        },
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

    // Filter by campaign ID if provided
    if (campaignId) {
      options.where.campaignId = campaignId;
    }

    // Filter by publisher ID if provided
    if (publisherId) {
      options.where.publisherId = publisherId;
    }

    // Filter by advertiser ID if provided
    if (advertiserId) {
      options.where.advertiserId = advertiserId;
    }

    // ✅ Add date filter
    if (startDate && endDate) {
      if (startDate === endDate) {
        // Same day filter (full day)
        options.where.timestamp = {
          [Op.between]: [
            new Date(`${startDate}T00:00:00.000Z`),
            new Date(`${endDate}T23:59:59.999Z`),
          ],
        };
      } else {
        // Date range filter
        options.where.timestamp = {
          [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
          [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
        };
      }
    } else if (startDate) {
      options.where.timestamp = {
        [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
      };
    } else if (endDate) {
      options.where.timestamp = {
        [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
      };
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
  } = req.query; // Retrieve filters from query
  const { company } = req.user; // Company filter

  const options = {
    limit: parseInt(pageSize, 10),
    offset: (parseInt(page, 10) - 1) * parseInt(pageSize, 10),
    include: [
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
            where: { company_id: company.id }, // Company filter
            required: true,
          },
        ],
      },
    ],
    where: {},
  };

  // Filter by campaign ID if provided
  if (campaignId) {
    options.where.campaignId = campaignId;
  }

  // Filter by publisher ID if provided
  if (publisherId) {
    options.where.publisherId = publisherId;
  }

  // Filter by advertiser ID if provided
  if (advertiserId) {
    options.where.advertiserId = advertiserId;
  }

  // Date filters on conversionTime (conversion date)
  if (startDate && endDate) {
    if (startDate === endDate) {
      // Same day filter (full day)
      options.where.conversionTime = {
        [Op.between]: [
          new Date(`${startDate}T00:00:00.000Z`),
          new Date(`${endDate}T23:59:59.999Z`),
        ],
      };
    } else {
      // Date range filter
      options.where.conversionTime = {
        [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
        [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
      };
    }
  } else if (startDate) {
    options.where.conversionTime = {
      [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
    };
  } else if (endDate) {
    options.where.conversionTime = {
      [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
    };
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

    // ✅ Add corresponding ID fields dynamically based on groupBy
    let idColumns = [];
    if (groupKeys.includes("campaign")) idColumns.push(`c.id AS "campaignId"`);
    if (groupKeys.includes("publisher"))
      idColumns.push(`pub.id AS "publisherId"`);
    if (groupKeys.includes("advertiser"))
      idColumns.push(`adv.id AS "advertiserId"`);

    const selectColumns = [
      ...groupColumns.map((col, index) => {
        const key = groupKeys[index];
        if (["day", "month", "year", "week"].includes(key)) {
          return `${col} AS "${key.charAt(0).toUpperCase() + key.slice(1)}"`;
        }
        return `${col} AS "${key}"`;
      }),
      ...idColumns, // ✅ Include ID fields
    ].join(", ");

    const groupClause = groupColumns.join(", ");

    // ---------------- Filters ----------------
    let filters = "WHERE 1=1";
    const replacements = { limit, offset };

    // Company filter
    if (company && company.id) {
      filters += " AND c.company_id = :companyId";
      replacements.companyId = company.id;
    }

    // --- ✅ Date filters (handles same-day range correctly)
    if (startDate && endDate) {
      const startOfDay = `${startDate} 00:00:00`;
      const endOfDay = `${endDate} 23:59:59`;
      filters += ` AND ct.timestamp BETWEEN :startDate AND :endDate`;
      replacements.startDate = startOfDay;
      replacements.endDate = endOfDay;
    } else if (startDate) {
      const startOfDay = `${startDate} 00:00:00`;
      filters += ` AND ct.timestamp >= :startDate`;
      replacements.startDate = startOfDay;
    } else if (endDate) {
      const endOfDay = `${endDate} 23:59:59`;
      filters += ` AND ct.timestamp <= :endDate`;
      replacements.endDate = endOfDay;
    }

    // Campaign filter
    if (campaign) {
      const campaignArray = Array.isArray(campaign)
        ? campaign
        : campaign.split(",").map((id) => id.trim());
      filters += ` AND c.id IN (:campaignArray)`;
      replacements.campaignArray = campaignArray;
    }

    // Publisher filter
    if (publisher) {
      const publisherArray = Array.isArray(publisher)
        ? publisher
        : publisher.split(",").map((id) => id.trim());
      filters += ` AND pub.id IN (:publisherArray)`;
      replacements.publisherArray = publisherArray;
    }

    // Advertiser filter
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
        GROUP BY ${groupClause}, ${idColumns
        .map((col) => col.split(" AS")[0])
        .join(", ")}
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
