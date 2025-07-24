const Joi = require("joi");

const assignCampaignValidator = Joi.object({
  campaignId: Joi.string().required().messages({
    "string.base": "Campaign ID must be a string",
    "any.required": "Campaign ID is required",
  }),

  publisherIds: Joi.array()
    .items(
      Joi.number().integer().positive().required().messages({
        "number.base": "Publisher ID must be a number",
        "number.integer": "Publisher ID must be an integer",
        "number.positive": "Publisher ID must be a positive number",
        "any.required": "Publisher ID is required",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Publisher IDs must be an array",
      "array.min": "At least one publisher ID is required",
      "any.required": "Publisher IDs are required",
    }),

  p1: Joi.string().optional().messages({
    "string.base": "p1 must be a string",
  }),

  p2: Joi.string().optional().messages({
    "string.base": "p2 must be a string",
  }),

  p3: Joi.string().optional().messages({
    "string.base": "p3 must be a string",
  }),

  p4: Joi.string().optional().messages({
    "string.base": "p4 must be a string",
  }),
});

module.exports = {
  assignCampaignValidator,
};
