const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("@config/sequelize.config");
const sequelizePaginate = require("@helper/pagination.helper");

const basename = path.basename(__filename);
const db = {};
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    sequelizePaginate.paginate(model); // Automatically enable pagination for all models
    db[model.name] = model;
  });
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
