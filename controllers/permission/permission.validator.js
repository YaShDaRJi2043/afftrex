const Joi = require("joi");

const createSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Permission name is required",
  }),
  label: Joi.string().allow("").optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  label: Joi.string().allow("").optional(),
});

module.exports = {
  createSchema,
  updateSchema,
};
