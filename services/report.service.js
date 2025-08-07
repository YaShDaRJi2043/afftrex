const { PixelTracking, CampaignTracking, Campaign } = require("@models");

exports.getPixelTrackingReport = async (query) => {
  const { page = 1, limit = 10, trackingId, conversionStatus } = query;

  const offset = (page - 1) * limit;

  const where = {};

  if (trackingId) where.trackingId = trackingId;
  if (conversionStatus) where.conversionStatus = conversionStatus;

  const result = await PixelTracking.findAndCountAll({
    where,
    include: [
      {
        model: CampaignTracking,
        as: "campaignTracking",
        required: false,
        include: [
          {
            model: Campaign,
            as: "campaign",
            attributes: ["id", "title"],
            required: false,
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    offset,
    limit: parseInt(limit),
  });

  return {
    total: result.count,
    page: parseInt(page),
    limit: parseInt(limit),
    data: result.rows,
  };
};
