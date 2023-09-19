const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

// Custom URL validation function
const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

// Validate clothing item
const validateClothingItem = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    imageUrl: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "imageUrl" field must be filled in',
      "string.uri": 'The "imageUrl" field must be a valid URL',
    }),
  }),
});

// Validate new user
const validateNewUser = celebrate({
  body: Joi.object().keys({
    username: Joi.string().min(2).max(30),
    avatarUrl: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "avatarUrl" field must be filled in',
      "string.uri": 'The "avatarUrl" field must be a valid URL',
    }),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

// Validate user login
const validateUserLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

// Validate ID
const validateId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex(),
  }),
});

// Export the validation functions
module.exports = {
  validateClothingItem,
  validateNewUser,
  validateUserLogin,
  validateId,
};
