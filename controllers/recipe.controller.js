const recipeService = require('../services/recipe.service');
const {sendResponse} = require('../utils/responseHandler');
const Joi = require('joi');

const base64ImageRegex = /^data:image\/(jpeg|png|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

const createRecipe = async (req, res) => {
    try {
        const body = req.body;

        let recipeValidator = Joi.object({
            title: Joi.string().required().min(3).max(50),
            instructions: Joi.string().required().min(10).max(10000),
            images: Joi.array()
            .items(
                Joi.string()
                    .pattern(base64ImageRegex)
                    .message('Each image must be a valid base64-encoded image.')
            )
            .min(1)
            .max(10)
            .required(),
            ingredients: Joi.array()
            .items(
                Joi.object({
                    ingredientId: Joi.string().required(),
                    quantity: Joi.string().required().max(20), // you can adjust limit
                    unit: Joi.string().required().max(20)
                })
            )
            .min(1)
            .required()
        })

        const {error} = recipeValidator.validate(body);

        if (error) {
            console.log("ERROR: ", "Bad Request");
            throw new Error("Bad Request");
        }

        const recipeCreatedData = await recipeService.createRecipe({...body, userId: req.user.userId});

        sendResponse(res, 200, 'Recipe created successfully', recipeCreatedData);
    } catch (error) {
        console.log(error)
        sendResponse(res, 400, error.message, null);
    }
}

module.exports = { createRecipe }