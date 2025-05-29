const { Permission } = require("@models/index");

exports.create = async (data) => {
  return await Permission.create(data);
};

exports.getAll = async () => {
  return await Permission.findAll({ order: [["created_at", "DESC"]] });
};

exports.getById = async (id) => {
  return await Permission.findByPk(id);
};

exports.update = async (id, data) => {
  const permission = await Permission.findByPk(id);
  if (!permission) return null;
  await permission.update(data);
  return permission;
};

exports.remove = async (id) => {
  const permission = await Permission.findByPk(id);
  if (!permission) return null;
  await permission.destroy();
  return true;
};
