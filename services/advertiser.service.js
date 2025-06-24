const { Advertiser, Company } = require("@models");
const { Op } = require("sequelize");

exports.createAdvertiser = async (req) => {
  const data = {
    ...req.body,
    company_id: req.user.company_id,
  };
  const advertiser = await Advertiser.create(data);
  return advertiser;
};

exports.getAllAdvertisers = async (req) => {
  const filters = req.body;
  const companyId = req.user.company.id;

  const stringFields = [
    "full_name",
    "email",
    "reference_id",
    "account_manager",
    "notes",
  ];

  const exactFields = ["status"];

  const whereFilter = {
    company_id: companyId,
  };

  for (const key in filters) {
    const value = filters[key];

    if (value !== undefined && value !== null && value !== "") {
      if (stringFields.includes(key)) {
        whereFilter[key] = { [Op.iLike]: `%${value}%` };
      } else if (exactFields.includes(key)) {
        whereFilter[key] = value;
      }
    }
  }

  const advertisers = await Advertiser.findAll({
    where: whereFilter,
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "admin_email"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return advertisers;
};

exports.getAdvertiserById = async (req) => {
  const { id } = req.params;
  const advertiser = await Advertiser.findByPk(id);
  if (!advertiser) throw new Error("Advertiser not found");
  return advertiser;
};

exports.updateAdvertiser = async (req) => {
  const { id } = req.params;
  const advertiser = await Advertiser.findByPk(id);

  if (!advertiser) throw new Error("Advertiser not found");

  await advertiser.update(req.body);
  return "Advertiser update successfully";
};

exports.deleteAdvertiser = async (req) => {
  const { id } = req.params;
  const advertiser = await Advertiser.findByPk(id);

  if (!advertiser) throw new Error("Advertiser not found");

  await advertiser.destroy();
  return "Advertiser deleted successfully";
};

exports.changeAdvertiserStatus = async (req) => {
  const { id } = req.params;
  const { status } = req.body;

  if (
    !["Active", "Inactive", "Pending", "Rejected", "Banned"].includes(status)
  ) {
    const error = new Error("Invalid status value");
    error.statusCode = 400;
    throw error;
  }

  const advertiser = await Advertiser.findByPk(id);
  if (!advertiser) throw new Error("Advertiser not found");

  advertiser.status = status;
  await advertiser.save();

  return `Advertiser status updated to ${status}`;
};
