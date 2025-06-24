const Ingredient = require('../models/ingredient.model');
const { uploadImages } = require('../utils/cloudinaryUtil');

const createIngredient = async (data) => {
  const { name, image } = data;

  const [imageUrl] = await uploadImages([image], 'ingredients');

  const ingredient = new Ingredient({ name, image: imageUrl });
  return ingredient.save();
};

const getAllIngredients = () => {
  return Ingredient.find().sort({ createdAt: -1 });
};

module.exports = {
  createIngredient,
  getAllIngredients,
};
