const Joi = require("joi");

const create = Joi.object({
  name: Joi.string().required(),
  admin_email: Joi.string().email().required(),
  subdomain: Joi.string().required(),
  logo: Joi.any(),
});

exports.extendSubscriptionSchema = Joi.object({
  days: Joi.number().integer().min(1).required(),
  amount: Joi.number().min(0).required(),
});

module.exports = { create };
