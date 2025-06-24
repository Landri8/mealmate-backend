const Recipe = require('../models/recipe.model');
const RecipeIngredient = require('../models/recipeIngredient.model');
const Ingredient = require('../models/ingredient.model');
const mongoose = require('mongoose');
const { uploadImages } = require('../utils/cloudinaryUtil');

const createRecipe = async (data) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { title, instructions, images, ingredients, userId } = data;

        // Step 1: Upload images to Cloudinary
        const uploadedImageUrls = await uploadImages(images);

        // Step 2: Create Recipe
        const recipe = new Recipe({
            title,
            instructions,
            images: uploadedImageUrls,
            createdBy: userId
        });

        const savedRecipe = await recipe.save({ session });

        // Step 3: Validate ingredient IDs (custom string id)
        const ingredientIds = ingredients.map(i => i.ingredientId);
        const existingIngredients = await Ingredient.find({ id: { $in: ingredientIds } });

        if (existingIngredients.length !== ingredientIds.length) {
            throw new Error('One or more ingredients do not exist');
        }

        // Step 4: Save entries to junction table
        const recipeIngredientDocs = ingredients.map(({ ingredientId, quantity, unit }) => ({
            recipeId: savedRecipe._id,
            ingredientId: existingIngredients.find(i => i.id === ingredientId)._id,
            quantity,
            unit
        }));

        await RecipeIngredient.insertMany(recipeIngredientDocs, { session });

        await session.commitTransaction();
        session.endSession();

        return {
            recipe: savedRecipe,
            images: uploadedImageUrls,
            ingredients: recipeIngredientDocs
        };

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

module.exports = {
    createRecipe
};
