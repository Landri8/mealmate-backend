const recipeService = require('../services/recipe.service');
const { sendResponse } = require('../utils/responseHandler');
const Joi = require('joi');

const base64ImageRegex = /^data:image\/(jpeg|png|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

const createRecipe = async (req, res) => {
    try {
        const body = req.body;
        console.log(body)

        const schema = Joi.object({
            recipe_id: Joi.string().allow(''),
            title: Joi.string().required().min(3).max(50),
            instructions: Joi.string().required().min(10).max(10000),

            images: Joi.array()
                .items(
                    Joi.alternatives().try(
                        Joi.string()
                            .pattern(base64ImageRegex)
                            .message('Each new image must be a valid base64-encoded image.'),
                        Joi.string()
                            .uri({ scheme: ['http', 'https'] })
                            .message('Each existing image must be a valid URL.')
                    )
                )
                .min(1)
                .max(10)
                .required(),

            ingredients: Joi.array()
                .items(
                    Joi.object({
                        ingredientId: Joi.string().required(),
                        quantity: Joi.string().required().max(20),
                        unit: Joi.string().required().max(20)
                    })
                )
                .min(1)
                .required(),

            category: Joi.string().required()
        });

        const { error, value } = schema.validate(body);
        if (error) {
            return sendResponse(res, 400, error.details[0].message, null);
        }

        const result = await recipeService.createRecipe({
            ...value,
            userId: req.user.userId
        });

        const msg = value.recipe_id
            ? 'Recipe updated successfully'
            : 'Recipe created successfully';

        sendResponse(res, 200, msg, result);
    } catch (err) {
        console.error(err);
        sendResponse(res, 400, err.message, null);
    }
};

const getRecipeDetail = async (req, res) => {
    // Validate that :id is present
    const schema = Joi.object({
        id: Joi.string().required()
    });
    const { error } = schema.validate(req.params);
    if (error) {
        return sendResponse(res, 400, error.details[0].message, null);
    }

    try {
        const detail = await recipeService.getRecipeDetail(req.params.id);
        sendResponse(res, 200, 'Recipe detail fetched', detail);
    } catch (err) {
        console.error(err);
        sendResponse(res, err.message.includes('not found') ? 404 : 500, err.message, null);
    }
};

const deleteRecipe = async (req, res) => {
  // Validate the :id param
  const schema = Joi.object({ id: Joi.string().required() });
  const { error } = schema.validate(req.params);
  if (error) {
    return sendResponse(res, 400, error.details[0].message, null);
  }

  try {
    // service will throw if not found or not authorized
    await recipeService.deleteRecipe(req.params.id, req.user.userId);
    sendResponse(res, 200, 'Recipe deleted successfully', null);
  } catch (err) {
    console.error(err);
    const code = err.message.includes('not found') ? 404 : 403;
    sendResponse(res, code, err.message, null);
  }
};

module.exports = { createRecipe, getRecipeDetail, deleteRecipe }