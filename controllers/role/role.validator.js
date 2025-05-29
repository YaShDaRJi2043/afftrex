const Joi = require("joi");

const create = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Role name is required",
  }),
  level: Joi.number().integer().required().messages({
    "number.base": "Level must be a number",
    "any.required": "Level is required",
  }),
  permission_ids: Joi.array()
    .items(Joi.number().integer())
    .required()
    .messages({
      "array.base": "Permission IDs must be an array of numbers",
    }),
});

const update = Joi.object({
  name: Joi.string().optional(),
  level: Joi.number().integer().optional(),
  permission_ids: Joi.array().items(Joi.number().integer()).optional(),
});

module.exports = { create, update };
