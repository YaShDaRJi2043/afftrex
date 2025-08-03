const { Campaign } = require("@models/index");
const { campaignQueue, redis } = require("@helper/campaignScheduler");

async function updateScheduledCampaignStatuses(
  campaignId,
  statusToBeSet,
  scheduleDate
) {
  const campaign = await await Campaign.findAll({
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
  const delay = new Date(scheduleDate).getTime() - now.getTime();

  const job = await campaignQueue.add(
    "campaign-schedule-queue",
    {
      campaignId,
      statusToBeSet,
    },
    {
      delay: delay > 0 ? delay : 0,
      attempts: 3,
      jobId: `campaign-${campaignId}-${new Date(scheduleDate).getTime()}`,
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
};
