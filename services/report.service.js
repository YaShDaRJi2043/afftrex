const { CampaignTracking, PixelTracking, Publisher } = require("@models");

exports.getCampaignTrackingByCampaignId = async (req) => {
  const { campaignId, page = 1, pageSize = 10 } = req.query; // Retrieve campaignId from query

  const options = {
    include: [
      {
        model: Publisher,
        as: "publisher",
        attributes: ["id", "name"],
      },
    ],
    limit: parseInt(pageSize),
    offset: (parseInt(page) - 1) * parseInt(pageSize),
  };

  if (campaignId) {
    options.where = { campaignId };
  }

  const [trackings, total] = await Promise.all([
    CampaignTracking.findAll(options),
    CampaignTracking.count(options.where ? { where: options.where } : {}),
  ]);

  return { ...trackings, total };
};

exports.getPixelTrackingByTrackingId = async (req) => {
  const { campaignId, page = 1, pageSize = 10 } = req.query; // Retrieve campaignId from query

  const options = {
    limit: parseInt(pageSize),
    offset: (parseInt(page) - 1) * parseInt(pageSize),
  };

  if (campaignId) {
    options.where = { campaignId };
  }

  const [pixelTrackings, total] = await Promise.all([
    PixelTracking.findAll(options),
    PixelTracking.count(options.where ? { where: options.where } : {}),
  ]);

  return { ...pixelTrackings, total };
};
