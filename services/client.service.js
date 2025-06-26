const Recipe = require('../models/recipe.model');
const Category = require('../models/category.model');
const mongoose = require('mongoose');

async function getHomeData(userId) {
  // 1) User’s own recipes (no instructions, no _id, no __v)
  const userCreatedRecipes = await Recipe
    .find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .select('-_id -__v -instructions')
    .lean();

  // 2) Top 10 most‐liked (no instructions, no _id, no __v)
  const recommendations = await Recipe
    .find()
    .sort({ likes: -1 })
    .limit(10)
    .select('-_id -__v -instructions')
    .lean();

  // 3) Categories + their recipes
  //    Keep _id here so we can lookup recipes by category._id
  const categoriesDocs = await Category
    .find()
    .sort({ createdAt: -1 })
    .select('-__v')
    .lean();

  const categories = await Promise.all(
    categoriesDocs.map(async cat => {
      const recipes = await Recipe
        .find({ category: cat._id })
        .sort({ createdAt: -1 })
        .select('-_id -__v -instructions')
        .lean();

      return {
        category_id:   cat.id,
        category_name: cat.title,
        recipes
      };
    })
  );

  return { userCreatedRecipes, recommendations, categories };
}

module.exports = { getHomeData };
