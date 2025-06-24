const Joi = require("joi");

const statusEnum = ["Active", "Pending", "Disabled", "Rejected", "Banned"];

const createAdvertiserSchema = Joi.object({
  full_name: Joi.string().required().messages({
    "string.empty": "Full Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Valid email is required",
    "string.empty": "Email is required",
  }),
  status: Joi.string()
    .valid(...statusEnum)
    .optional()
    .messages({
      "any.only": `Status must be one of: ${statusEnum.join(", ")}`,
    }),
  reference_id: Joi.string().optional().allow(null, ""),
  password: Joi.string().optional().allow(null, ""),
  account_manager: Joi.string().optional().allow(null, ""),
  notes: Joi.string().optional().allow(null, ""),
});

const updateAdvertiserSchema = Joi.object({
  full_name: Joi.string().optional().messages({
    "string.empty": "Full Name cannot be empty",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "Valid email is required",
  }),
  status: Joi.string()
    .valid(...statusEnum)
    .optional()
    .messages({
      "any.only": `Status must be one of: ${statusEnum.join(", ")}`,
    }),
  reference_id: Joi.string().optional().allow(null, ""),
  password: Joi.string().optional().allow(null, ""),
  account_manager: Joi.string().optional().allow(null, ""),
  notes: Joi.string().optional().allow(null, ""),
});

module.exports = {
  createAdvertiserSchema,
  updateAdvertiserSchema,
};
