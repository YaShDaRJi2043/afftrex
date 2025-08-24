const { CampaignTracking, PixelTracking, Publisher } = require("@models");

exports.getCampaignTrackingByCampaignId = async (req) => {
  const { campaignId } = req.params;
  const { page = 1, pageSize = 10 } = req.query; // Default to page 1 and pageSize 10

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
  const { campaignId } = req.params;
  const { page = 1, pageSize = 10 } = req.query; // Default to page 1 and pageSize 10

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
