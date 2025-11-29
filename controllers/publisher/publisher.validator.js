const Joi = require("joi");

const statusEnum = ["Active", "Pending", "Disabled", "Rejected", "Banned"];

const createPublisherSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Full Name is required",
  }),
  username: Joi.string().optional().allow(null, ""),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  password: Joi.string().min(6).max(100).optional().allow(null, "").messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must be at most 100 characters",
  }),
  notify: Joi.boolean().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base": "Phone must be 10-15 digits",
    }),
  status: Joi.string()
    .valid(...statusEnum)
    .optional(),

  country: Joi.string().optional().allow(null, ""),
  city: Joi.string().optional().allow(null, ""),
  state: Joi.string().optional().allow(null, ""),
  zip_code: Joi.string().optional().allow(null, ""),

  country_secondary: Joi.string().optional().allow(null, ""),
  city_secondary: Joi.string().optional().allow(null, ""),
  state_secondary: Joi.string().optional().allow(null, ""),
  zip_code_secondary: Joi.string().optional().allow(null, ""),
  phone_secondary: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base": "Secondary phone must be 10-15 digits",
    }),

  company: Joi.string().optional().allow(null, ""),
  microsoft_teams: Joi.string().optional().allow(null, ""),
  address: Joi.string().optional().allow(null, ""),
  note: Joi.string().optional().allow(null, ""),

  entity_type: Joi.string().optional().allow(null, ""),
  im_type: Joi.string().optional().allow(null, ""),
  im_username: Joi.string().optional().allow(null, ""),
  promotion_method: Joi.string().optional().allow(null, ""),
  tax_id: Joi.string().optional().allow(null, ""),
  referred_by: Joi.string().optional().allow(null, ""),
  manager_id: Joi.number().integer().optional().allow(null).messages({
    "number.base": "Manager ID must be a number",
  }),
  tags: Joi.array().items(Joi.string()).optional(),

  companyName: Joi.string().optional().allow(null, ""),
  companyAddress: Joi.string().optional().allow(null, ""),
});

const updatePublisherSchema = Joi.object({
  name: Joi.string().optional(),
  username: Joi.string().optional().allow(null, ""),
  email: Joi.string().email().optional().messages({
    "string.email": "Email must be valid",
  }),
  password: Joi.string().min(6).max(100).optional().allow(null, "").messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must be at most 100 characters",
  }),
  notify: Joi.boolean().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base": "Phone must be 10-15 digits",
    }),
  status: Joi.string()
    .valid(...statusEnum)
    .optional(),

  country: Joi.string().optional().allow(null, ""),
  city: Joi.string().optional().allow(null, ""),
  state: Joi.string().optional().allow(null, ""),
  zip_code: Joi.string().optional().allow(null, ""),

  country_secondary: Joi.string().optional().allow(null, ""),
  city_secondary: Joi.string().optional().allow(null, ""),
  state_secondary: Joi.string().optional().allow(null, ""),
  zip_code_secondary: Joi.string().optional().allow(null, ""),
  phone_secondary: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base": "Secondary phone must be 10-15 digits",
    }),

  company: Joi.string().optional().allow(null, ""),
  microsoft_teams: Joi.string().optional().allow(null, ""),
  address: Joi.string().optional().allow(null, ""),
  note: Joi.string().optional().allow(null, ""),

  entity_type: Joi.string().optional().allow(null, ""),
  im_type: Joi.string().optional().allow(null, ""),
  im_username: Joi.string().optional().allow(null, ""),
  promotion_method: Joi.string().optional().allow(null, ""),
  tax_id: Joi.string().optional().allow(null, ""),
  referred_by: Joi.string().optional().allow(null, ""),
  manager_id: Joi.number().integer().optional().allow(null).messages({
    "number.base": "Manager ID must be a number",
  }),
  tags: Joi.array().items(Joi.string()).optional(),

  companyName: Joi.string().optional().allow(null, ""),
  companyAddress: Joi.string().optional().allow(null, ""),
});

const statusChangeSchema = Joi.object({
  status: Joi.string()
    .valid(...statusEnum)
    .required()
    .messages({
      "any.only": `Status must be one of: ${statusEnum.join(", ")}`,
      "string.empty": "Status is required",
    }),
});

module.exports = {
  createPublisherSchema,
  updatePublisherSchema,
  statusChangeSchema,
};
