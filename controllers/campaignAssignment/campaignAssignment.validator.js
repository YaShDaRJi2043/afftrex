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
});

module.exports = {
  assignCampaignValidator,
};
