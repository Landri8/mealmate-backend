const express = require('express');
const router = express.Router();

const recipeController = require('../controllers/recipe.controller');

router.post('/create', recipeController.createRecipe);
router.get('/:id', recipeController.getRecipeDetail);
router.delete('/:id', recipeController.deleteRecipe);


module.exports = router;