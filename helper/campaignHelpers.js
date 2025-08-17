const crypto = require("crypto");

const { secret } = require("@config/config");
const { Campaign } = require("@models/index");
const { campaignQueue, redis } = require("@helper/campaignScheduler");

// Generate Security Token
function generateSecurityToken(campaignId, scheduleDate) {
  const secretKey = secret.SECURITY_TOKEN_SECRET;
  const timestamp = scheduleDate
    ? new Date(scheduleDate).getTime()
    : Date.now();
  const data = `${campaignId}:${timestamp}`;
  return crypto.createHmac("sha256", secretKey).update(data).digest("hex");
}

async function updateScheduledCampaignStatuses(
  campaignId,
  statusToBeSet,
  scheduleDate
) {
  const campaign = await Campaign.findAll({
    where: {
      id: campaignId,
    },
  });
  if (!campaign) throw new Error("Campaign not found");

  // Remove old job if exists
  if (campaign.scheduledJobId) {
    const oldJob = await campaignQueue.getJob(campaign.scheduledJobId);
    if (oldJob) await oldJob.remove();
  }

  const now = new Date();
  const delay = scheduleDate
    ? new Date(scheduleDate).getTime() - now.getTime()
    : 0;

  const job = await campaignQueue.add(
    "campaign-schedule-queue",
    {
      campaignId,
      statusToBeSet,
    },
    {
      delay: delay > 0 ? delay : 0,
      attempts: 3,
      jobId: `campaign-${campaignId}-${
        scheduleDate ? new Date(scheduleDate).getTime() : Date.now()
      }`,
    }
  );

  if (delay > 0) {
    const ttl = Math.ceil(delay / 1000) + 60;
    await redis.setex(
      `campaign:schedule:${campaign.id}`,
      ttl,
      JSON.stringify({
        jobId: job.id,
        campaignId: campaign.id,
        scheduleDate,
        statusToBeSet,
      })
    );
  }

  return job;
}

module.exports = {
  updateScheduledCampaignStatuses,
  generateSecurityToken,
};
