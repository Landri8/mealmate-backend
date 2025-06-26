const Category = require('../models/category.model');

async function createCategory(data) {
  const category = new Category(data);
  return category.save();
}

function getAllCategories() {
  return Category.find().sort({ createdAt: -1 });
}

module.exports = {
  createCategory,
  getAllCategories
};
