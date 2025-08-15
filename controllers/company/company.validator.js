const Joi = require("joi");

const create = Joi.object({
  name: Joi.string().required(),
  admin_email: Joi.string().email().required(),
  subdomain: Joi.string().required(),
  logo: Joi.any(),
  subscription_type: Joi.string().valid("free", "paid").default("free"),
  subscription_days: Joi.number().integer().min(1).default(30),
  subscription_start_date: Joi.date().optional(),
  amount: Joi.number().min(0).default(0),
  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .default("pending"),
});

const extendSubscriptionSchema = Joi.object({
  days: Joi.number().integer().min(1).required(),
  amount: Joi.number().min(0).required(),
});

module.exports = { create, extendSubscriptionSchema };
