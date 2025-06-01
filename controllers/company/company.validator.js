const Joi = require("joi");

const create = Joi.object({
  name: Joi.string().required(),
  admin_email: Joi.string().email().required(),
  subdomain: Joi.string().required(),
  logo: Joi.any(),
});

module.exports = { create };
