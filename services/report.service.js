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

  const trackings = await CampaignTracking.findAll(options);

  return trackings;
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

  const pixelTrackings = await PixelTracking.findAll(options);

  return pixelTrackings;
};
