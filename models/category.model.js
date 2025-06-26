const mongoose = require('mongoose');
const { generateID, getCurrentFormattedDate } = require('../utils/commonUtil');

const categorySchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => generateID('CAT'),
    unique: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  createdAt: {
    type: String,
    default: () => getCurrentFormattedDate()
  }
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
