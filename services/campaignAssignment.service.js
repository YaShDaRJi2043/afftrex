const { Campaign, Publisher, CampaignAssignment } = require("@models");
const { serverInfo } = require("@config/config");

exports.assignCampaignToPublishers = async ({ campaignId, publisherIds }) => {
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) throw new Error("Campaign not found");

  const assignments = [];

  for (const publisherId of publisherIds) {
    const publisher = await Publisher.findByPk(publisherId);
    if (!publisher) throw new Error(`Publisher ${publisherId} not found`);

    const publisherLink = `${serverInfo.front_url}c/${campaignId}?pub=${publisherId}`;

    const assignment = await CampaignAssignment.create({
      campaignId,
      publisherId,
      publisherLink,
    });

    assignments.push(assignment);
  }

  return assignments;
};
