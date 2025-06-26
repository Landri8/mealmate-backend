const Joi = require('joi');
const categoryService = require('../services/category.service');
const { sendResponse } = require('../utils/responseHandler');

const createCategory = async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional().allow('')
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return sendResponse(res, 400, error.details[0].message, null);
  }

  try {
    const category = await categoryService.createCategory(value);
    sendResponse(res, 201, 'Category created successfully', category);
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, err.message, null);
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    sendResponse(res, 200, 'Categories fetched successfully', categories);
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, err.message, null);
  }
};

module.exports = {
  createCategory,
  getAllCategories
};
