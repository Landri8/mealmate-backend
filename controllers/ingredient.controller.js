const Joi = require('joi');
const ingredientService = require('../services/ingredient.service');
const { sendResponse } = require('../utils/responseHandler');

const base64ImageRegex = /^data:image\/(jpeg|png|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

const createIngredient = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().min(1).max(50).required(),
      image: Joi.string()
        .pattern(base64ImageRegex)
        .message('Image must be a valid base64-encoded image.')
        .required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return sendResponse(res, 400, error.details[0].message, null);
    }

    const ingredient = await ingredientService.createIngredient(value);
    sendResponse(res, 201, 'Ingredient created successfully', ingredient);
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, err.message, null);
  }
};


const getAllIngredients = async (req, res) => {
  try {
    const ingredients = await ingredientService.getAllIngredients();
    sendResponse(res, 200, 'Ingredients fetched successfully', ingredients);
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, err.message, null);
  }
};

module.exports = {
  createIngredient,
  getAllIngredients
};
