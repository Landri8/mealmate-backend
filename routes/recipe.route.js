const express = require('express');
const router = express.Router();

const recipeController = require('../controllers/recipe.controller');

router.post('/create', recipeController.createRecipe);

module.exports = router;