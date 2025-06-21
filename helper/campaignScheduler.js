const { Queue } = require("bullmq");
const { redisConfigs } = require("@config/config");
const Redis = require("ioredis");

const redis = new Redis({
  host: redisConfigs.redisHost,
  port: 19060,
  username: redisConfigs.redisUser,
  password: redisConfigs.redisPassword,
  maxRetriesPerRequest: null,
});

const campaignQueue = new Queue("campaign-schedule-queue", {
  connection: redis,
});

module.exports = { campaignQueue, redis };
