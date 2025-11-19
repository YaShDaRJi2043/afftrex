const { Op } = require("sequelize");

const {
  CampaignTracking,
  PixelTracking,
  Publisher,
  Advertiser,
  Campaign,
  sequelize,
} = require("@models");
const {
  istDateToUTC,
  createTimeGroupExpression,
  buildGroupByMap,
  buildSelectColumns,
  buildFilters,
  addDateFilter,
  buildJoinConditions,
  buildOrderByClause,
  parseGroupByKeys,
} = require("@helper/reportHelpers");

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
          attributes: ["id", "title", "company_id", "redirectType"],
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

    // IST date filter
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

    // Modify referer if it is 302 with hide referrer
    trackings.forEach((tracking) => {
      if (tracking?.campaign?.redirectType === "302 with hide referrer") {
        tracking.referer = "Hide Referrer";
      }
    });

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

  // Handle multiple publisherId values
  if (publisherId) {
    const publisherArray = Array.isArray(publisherId)
      ? publisherId
      : publisherId.split(",").map((id) => id.trim());
    options.where.publisherId = { [Op.in]: publisherArray };
  }

  // Handle multiple advertiserId values
  if (advertiserId) {
    const advertiserArray = Array.isArray(advertiserId)
      ? advertiserId
      : advertiserId.split(",").map((id) => id.trim());
    options.where.advertiserId = { [Op.in]: advertiserArray };
  }

  // IST date filter for conversionTime
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

    // Parse and validate group keys
    const groupKeys = parseGroupByKeys(groupBy);

    // Build group by maps with time expressions
    const conversionGroupMap = {
      ...buildGroupByMap(),
      year: createTimeGroupExpression("pt.conversion_time", "year"),
      month: createTimeGroupExpression("pt.conversion_time", "month"),
      week: createTimeGroupExpression("pt.conversion_time", "week"),
      day: createTimeGroupExpression("pt.conversion_time", "day"),
    };

    const clickGroupMap = {
      ...buildGroupByMap("click"),
      year: createTimeGroupExpression("ct_click.created_at", "year"),
      month: createTimeGroupExpression("ct_click.created_at", "month"),
      week: createTimeGroupExpression("ct_click.created_at", "week"),
      day: createTimeGroupExpression("ct_click.created_at", "day"),
    };

    // Build SELECT columns
    const conversionSelectCols = buildSelectColumns(
      groupKeys,
      conversionGroupMap
    );
    const clickSelectCols = buildSelectColumns(groupKeys, clickGroupMap);

    if (!conversionSelectCols.length || !clickSelectCols.length) {
      throw new Error("Invalid groupBy field(s)");
    }

    // Build GROUP BY expressions
    const conversionGroupExprs = groupKeys
      .map((k) => conversionGroupMap[k])
      .filter(Boolean);
    const clickGroupExprs = groupKeys
      .map((k) => clickGroupMap[k])
      .filter(Boolean);

    // Build filters
    const filterParams = {
      company,
      startDate,
      endDate,
      campaign,
      publisher,
      advertiser,
    };

    const { filters: baseFilters, replacements } = buildFilters(filterParams);

    const conversionFilters = addDateFilter(
      baseFilters,
      "pt.conversion_time",
      startDate,
      endDate
    );

    const clickFilters = addDateFilter(
      buildFilters(filterParams, {
        ct: "ct_click",
        pub: "pub_click",
        adv: "adv_click",
      }).filters,
      "ct_click.created_at",
      startDate,
      endDate
    );

    // Add pagination to replacements
    replacements.limit = limit;
    replacements.offset = offset;

    // Build JOIN and ORDER BY clauses
    const joinConditions = buildJoinConditions(groupKeys);
    const orderBy = buildOrderByClause(groupKeys);

    // Execute main query
    const results = await sequelize.query(
      `
      WITH click_counts AS (
        SELECT 
          ${clickSelectCols.join(", ")},
          COUNT(DISTINCT ct_click.id) AS "grossClicks"
        FROM campaigns c
        LEFT JOIN advertisers adv_click ON adv_click.id = c.advertiser_id
        LEFT JOIN campaign_trackings ct_click ON ct_click.campaign_id = c.id
        LEFT JOIN publishers pub_click ON pub_click.id = ct_click.publisher_id
        ${clickFilters}
        GROUP BY ${clickGroupExprs.join(", ")}
      ),
      conversion_data AS (
        SELECT 
          ${conversionSelectCols.join(", ")},
          COUNT(DISTINCT pt.id) AS "totalConversions",
          COALESCE(SUM(pt.revenue), 0) AS "totalRevenue",
          COALESCE(SUM(pt.payout), 0) AS "totalPayout",
          COALESCE(SUM(pt.profit), 0) AS "totalProfit"
        FROM campaigns c
        LEFT JOIN advertisers adv ON adv.id = c.advertiser_id
        LEFT JOIN campaign_trackings ct ON ct.campaign_id = c.id
        LEFT JOIN publishers pub ON pub.id = ct.publisher_id
        LEFT JOIN pixel_tracking pt ON pt.tracking_id = ct.id
        ${conversionFilters}
        GROUP BY ${conversionGroupExprs.join(", ")}
      )
      SELECT 
        cd.*,
        COALESCE(cc."grossClicks", 0) AS "grossClicks"
      FROM conversion_data cd
      LEFT JOIN click_counts cc ON ${joinConditions}
      ORDER BY ${orderBy}
      LIMIT :limit OFFSET :offset
      `,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    // Get total count
    const totalRecordsQuery = await sequelize.query(
      `
      SELECT COUNT(*) AS count FROM (
        SELECT ${conversionGroupExprs.join(", ")}
        FROM campaigns c
        LEFT JOIN advertisers adv ON adv.id = c.advertiser_id
        LEFT JOIN campaign_trackings ct ON ct.campaign_id = c.id
        LEFT JOIN publishers pub ON pub.id = ct.publisher_id
        LEFT JOIN pixel_tracking pt ON pt.tracking_id = ct.id
        ${conversionFilters}
        GROUP BY ${conversionGroupExprs.join(", ")}
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
