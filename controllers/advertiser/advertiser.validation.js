const Joi = require("joi");

const statusEnum = ["Active", "Pending", "Disabled", "Rejected", "Banned"];

const createAdvertiserSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Valid email is required",
    "string.empty": "Email is required",
  }),

  password: Joi.string().min(6).max(100).optional().allow(null, "").messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must be at most 100 characters",
  }),

  status: Joi.string()
    .valid(...statusEnum)
    .optional()
    .messages({
      "any.only": `Status must be one of: ${statusEnum.join(", ")}`,
    }),

  reference_id: Joi.string().optional().allow(null, ""),
  managers: Joi.string().optional().allow(null, ""),
  notes: Joi.string().optional().allow(null, ""),
  phone: Joi.string()
    .pattern(/^\+?\d{10,15}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base": "Phone must be 10-15 digits and can start with +",
    }),
  entity_type: Joi.string().optional().allow(null, ""),
  website_url: Joi.string().uri().optional().allow(null, ""),
  companyName: Joi.string().optional().allow(null, ""),
  company: Joi.string().optional().allow(null, ""),
  notify: Joi.boolean().optional(),
  state: Joi.string().optional().allow(null, ""),
});

const updateAdvertiserSchema = Joi.object({
  name: Joi.string().optional().messages({
    "string.empty": "Name cannot be empty",
  }),

  email: Joi.string().email().optional().messages({
    "string.email": "Valid email is required",
  }),

  password: Joi.string().min(6).max(100).optional().allow(null, "").messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must be at most 100 characters",
  }),

  status: Joi.string()
    .valid(...statusEnum)
    .optional()
    .messages({
      "any.only": `Status must be one of: ${statusEnum.join(", ")}`,
    }),

  reference_id: Joi.string().optional().allow(null, ""),
  managers: Joi.string().optional().allow(null, ""),
  notes: Joi.string().optional().allow(null, ""),
  phone: Joi.string()
    .pattern(/^\+?\d{10,15}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base": "Phone must be 10-15 digits and can start with +",
    }),
  entity_type: Joi.string().optional().allow(null, ""),
  website_url: Joi.string().uri().optional().allow(null, ""),
  companyName: Joi.string().optional().allow(null, ""),
  state: Joi.string().optional().allow(null, ""),
});

module.exports = {
  createAdvertiserSchema,
  updateAdvertiserSchema,
};
