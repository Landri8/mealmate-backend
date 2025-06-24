const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredient.controller');

router.post('/create', ingredientController.createIngredient);
router.get('/', ingredientController.getAllIngredients);

module.exports = router;
