const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5:30 in milliseconds

/**
 * Convert IST date string to UTC Date for DB filtering
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {boolean} isStart - Whether this is start of day (00:00:00) or end of day (23:59:59)
 * @returns {Date} UTC Date object
 */
const istDateToUTC = (dateString, isStart = true) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const hours = isStart ? 0 : 23;
  const minutes = isStart ? 0 : 59;
  const seconds = isStart ? 0 : 59;
  const ms = isStart ? 0 : 999;

  const istDate = new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds, ms)
  );
  return new Date(istDate.getTime() - IST_OFFSET_MS);
};

/**
 * Base group by mapping for static fields
 */
const BASE_GROUP_BY_MAP = {
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
};

/**
 * Create time-based group expressions for different time units
 * @param {string} timeColumn - The column name to group by (e.g., 'pt.conversion_time')
 * @param {string} timeUnit - Time unit: 'year', 'month', 'week', or 'day'
 * @returns {string|null} SQL expression for time grouping
 */
const createTimeGroupExpression = (timeColumn, timeUnit) => {
  const expressions = {
    year: `TO_CHAR(${timeColumn} + interval '5 hours 30 minutes', 'YYYY')`,
    month: `TO_CHAR(${timeColumn} + interval '5 hours 30 minutes', 'Mon')`,
    week: `TO_CHAR(DATE_TRUNC('week', ${timeColumn} + interval '5 hours 30 minutes'), 'DD-MM-YYYY') || ' to ' || TO_CHAR(DATE_TRUNC('week', ${timeColumn} + interval '5 hours 30 minutes') + INTERVAL '6 days', 'DD-MM-YYYY')`,
    day: `TO_CHAR(${timeColumn} + interval '5 hours 30 minutes', 'DD-MM-YYYY')`,
  };
  return expressions[timeUnit] || null;
};

/**
 * Build group by map dynamically with table prefixes
 * @param {string} tablePrefix - Prefix for table aliases (e.g., 'click' for ct_click)
 * @returns {Object} Group by map with prefixed table aliases
 */
const buildGroupByMap = (tablePrefix = "") => {
  const ctPrefix = tablePrefix ? `ct_${tablePrefix}` : "ct";
  const pubPrefix = tablePrefix ? `pub_${tablePrefix}` : "pub";
  const advPrefix = tablePrefix ? `adv_${tablePrefix}` : "adv";

  return {
    ...BASE_GROUP_BY_MAP,
    publisher: `${pubPrefix}.name`,
    publisherId: `${pubPrefix}.id`,
    publisherManager: `${pubPrefix}.managers`,
    advertiser: `${advPrefix}.name`,
    advertiserId: `${advPrefix}.id`,
    advertiserManager: `${advPrefix}.managers`,
    device: `${ctPrefix}.device`,
    os: `${ctPrefix}.os`,
    country: `${ctPrefix}.country`,
  };
};

/**
 * Build SELECT columns from group keys
 * @param {string[]} groupKeys - Array of group by keys
 * @param {Object} groupByMapObj - Group by map object
 * @returns {string[]} Array of SELECT column expressions
 */
const buildSelectColumns = (groupKeys, groupByMapObj) => {
  return groupKeys
    .map((key) => {
      const col = groupByMapObj[key];
      if (!col) return null;

      const alias = ["day", "month", "year", "week"].includes(key)
        ? `"${key.charAt(0).toUpperCase() + key.slice(1)}"`
        : `"${key}"`;

      return `${col} AS ${alias}`;
    })
    .filter(Boolean);
};

/**
 * Build WHERE filters for SQL query
 * @param {Object} params - Filter parameters
 * @param {Object} params.company - Company object with id
 * @param {string} params.startDate - Start date in YYYY-MM-DD format
 * @param {string} params.endDate - End date in YYYY-MM-DD format
 * @param {string|string[]} params.campaign - Campaign ID(s)
 * @param {string|string[]} params.publisher - Publisher ID(s)
 * @param {string|string[]} params.advertiser - Advertiser ID(s)
 * @param {Object} tableAliases - Table alias overrides
 * @returns {Object} Object with filters string and replacements object
 */
const buildFilters = (params, tableAliases = {}) => {
  const { company, startDate, endDate, campaign, publisher, advertiser } =
    params;
  const { ct = "ct", pub = "pub", adv = "adv" } = tableAliases;

  let filters = "WHERE 1=1";
  const replacements = {};

  if (company?.id) {
    filters += " AND c.company_id = :companyId";
    replacements.companyId = company.id;
  }

  if (startDate && endDate) {
    replacements.startDate = istDateToUTC(startDate, true).toISOString();
    replacements.endDate = istDateToUTC(endDate, false).toISOString();
  } else if (startDate) {
    replacements.startDate = istDateToUTC(startDate, true).toISOString();
  } else if (endDate) {
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
    filters += ` AND ${pub}.id IN (:publisherArray)`;
    replacements.publisherArray = publisherArray;
  }

  if (advertiser) {
    const advertiserArray = Array.isArray(advertiser)
      ? advertiser
      : advertiser.split(",").map((id) => id.trim());
    filters += ` AND ${adv}.id IN (:advertiserArray)`;
    replacements.advertiserArray = advertiserArray;
  }

  return { filters, replacements };
};

/**
 * Add date range filter to existing filters
 * @param {string} filters - Existing WHERE clause
 * @param {string} dateColumn - Column name to filter
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {string} Updated filters string
 */
const addDateFilter = (filters, dateColumn, startDate, endDate) => {
  if (startDate && endDate) {
    return `${filters} AND ${dateColumn} BETWEEN :startDate AND :endDate`;
  } else if (startDate) {
    return `${filters} AND ${dateColumn} >= :startDate`;
  } else if (endDate) {
    return `${filters} AND ${dateColumn} <= :endDate`;
  }
  return filters;
};

/**
 * Build JOIN conditions for CTE combination
 * @param {string[]} groupKeys - Array of group by keys
 * @returns {string} JOIN condition string
 */
const buildJoinConditions = (groupKeys) => {
  return groupKeys
    .map((key) => {
      const alias = ["day", "month", "year", "week"].includes(key)
        ? `"${key.charAt(0).toUpperCase() + key.slice(1)}"`
        : `"${key}"`;
      return `cd.${alias} = cc.${alias}`;
    })
    .join(" AND ");
};

/**
 * Build ORDER BY clause
 * @param {string[]} groupKeys - Array of group by keys
 * @param {string} tableAlias - Table alias prefix (e.g., 'cd')
 * @returns {string} ORDER BY clause string
 */
const buildOrderByClause = (groupKeys, tableAlias = "cd") => {
  return groupKeys
    .map((key) => {
      const alias = ["day", "month", "year", "week"].includes(key)
        ? `"${key.charAt(0).toUpperCase() + key.slice(1)}"`
        : `"${key}"`;
      return `${tableAlias}.${alias}`;
    })
    .join(", ");
};

/**
 * Parse and validate group by keys
 * @param {string} groupByString - Comma-separated group by keys
 * @returns {string[]} Array of validated group keys
 * @throws {Error} If no valid group keys provided
 */
const parseGroupByKeys = (groupByString) => {
  const groupKeys = groupByString
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (!groupKeys.length) {
    throw new Error("Please provide at least one groupBy field");
  }

  return groupKeys;
};

module.exports = {
  istDateToUTC,
  createTimeGroupExpression,
  buildGroupByMap,
  buildSelectColumns,
  buildFilters,
  addDateFilter,
  buildJoinConditions,
  buildOrderByClause,
  parseGroupByKeys,
};
