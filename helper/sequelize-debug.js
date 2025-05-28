const { QueryTypes } = require("sequelize");

function setupSequelizeDebug(sequelize, { explain = false } = {}) {
  const originalQuery = sequelize.query.bind(sequelize);

  sequelize.query = async function (sql, options = {}) {
    const isExplain =
      typeof sql === "string" && sql.trim().toUpperCase().startsWith("EXPLAIN");
    const isSelect =
      typeof sql === "string" && sql.trim().toUpperCase().startsWith("SELECT");
    const startTime = Date.now();

    if (explain && isSelect && !isExplain) {
      try {
        const explainOutput = await originalQuery(`EXPLAIN ${sql}`, {
          ...options,
          type: QueryTypes.SELECT,
          raw: true,
          nest: true,
        });

        console.log("🔍 EXPLAIN Result:", explainOutput);
      } catch (err) {
        console.warn("⚠️ Failed to EXPLAIN:", err.message);
      }
    }
    const result = await originalQuery(sql, options);
    const duration = Date.now() - startTime;
    console.log(`🕒 Query took ${duration}ms`);
    return result;
  };
}

module.exports = setupSequelizeDebug;
