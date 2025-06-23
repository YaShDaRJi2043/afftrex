const { Queue } = require("bullmq");
const Redis = require("ioredis");
const { redisConfigs } = require("@config/config");

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

module.exports = {
  campaignQueue,
  redis,
};
