const { CampaignTracking, PixelTracking, Publisher } = require("@models");

exports.getCampaignTrackingByCampaignId = async (req) => {
  const { campaignId } = req.params;

  const trackings = await CampaignTracking.findAll({
    where: { campaignId },
    include: [
      {
        model: Publisher,
        as: "publisher",
        attributes: ["id", "name"],
      },
    ],
  });

  return trackings;
};

exports.getPixelTrackingByTrackingId = async (req) => {
  const { campaignId } = req.params;

  const pixelTrackings = await PixelTracking.findAll({
    where: { campaignId },
  });

  return pixelTrackings;
};
