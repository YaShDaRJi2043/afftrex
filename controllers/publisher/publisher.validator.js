const Joi = require("joi");

const statusEnum = ["Active", "Pending", "Disabled", "Rejected", "Banned"];

const createPublisherSchema = Joi.object({
  full_name: Joi.string().required().messages({
    "string.empty": "Full Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  status: Joi.string()
    .valid(...statusEnum)
    .optional(),
  country: Joi.string().optional().allow(null, ""),
  city: Joi.string().optional().allow(null, ""),
  state: Joi.string().optional().allow(null, ""),
  zip_code: Joi.string().optional().allow(null, ""),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base": "Phone must be 10-15 digits",
    }),
  entity_type: Joi.string().optional().allow(null, ""),
  im_type: Joi.string().optional().allow(null, ""),
  im_username: Joi.string().optional().allow(null, ""),
  promotion_method: Joi.string().optional().allow(null, ""),
  reference_id: Joi.string().optional().allow(null, ""),
  notify: Joi.boolean().optional(),
  signup_company_name: Joi.string().optional().allow(null, ""),
  signup_company_address: Joi.string().optional().allow(null, ""),
});

const updatePublisherSchema = Joi.object({
  full_name: Joi.string().optional(),
  email: Joi.string().email().optional().messages({
    "string.email": "Email must be valid",
  }),
  status: Joi.string()
    .valid(...statusEnum)
    .optional(),
  country: Joi.string().optional().allow(null, ""),
  city: Joi.string().optional().allow(null, ""),
  state: Joi.string().optional().allow(null, ""),
  zip_code: Joi.string().optional().allow(null, ""),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base": "Phone must be 10-15 digits",
    }),
  entity_type: Joi.string().optional().allow(null, ""),
  im_type: Joi.string().optional().allow(null, ""),
  im_username: Joi.string().optional().allow(null, ""),
  promotion_method: Joi.string().optional().allow(null, ""),
  reference_id: Joi.string().optional().allow(null, ""),
  notify_by_email: Joi.boolean().optional(),
  signup_company_name: Joi.string().optional().allow(null, ""),
  signup_company_address: Joi.string().optional().allow(null, ""),
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
