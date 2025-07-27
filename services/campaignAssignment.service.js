const { Campaign, Publisher, CampaignAssignment } = require("@models");
const { serverInfo } = require("@config/config");

exports.assignCampaignToPublishers = async ({
  campaignId,
  publisherIds,
  p1,
  p2,
  p3,
  p4,
}) => {
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) throw new Error("Campaign not found");

  const assignments = [];

  for (const publisherId of publisherIds) {
    const publisher = await Publisher.findByPk(publisherId);
    if (!publisher) throw new Error(`Publisher ${publisherId} not found`);

    const queryParams = new URLSearchParams({ pub: publisherId });
    if (p1) queryParams.append("p1", p1);
    if (p2) queryParams.append("p2", p2);
    if (p3) queryParams.append("p3", p3);
    if (p4) queryParams.append("p4", p4);

    const publisherLink = `${
      serverInfo.api_url
    }/public/c/${campaignId}?${queryParams.toString()}`;

    const assignment = await CampaignAssignment.create({
      campaignId,
      publisherId,
      publisherLink,
      p1,
      p2,
      p3,
      p4,
    });

    assignments.push(assignment);
  }

  return assignments;
};
