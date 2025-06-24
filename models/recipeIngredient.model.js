const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema({
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
    ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    quantity: { type: String, required: true }, 
    unit: { type: String, required: true },
});

const RecipeIngredient = mongoose.model('RecipeIngredient', recipeIngredientSchema);

module.exports = RecipeIngredient;