const mongoose = require('mongoose');
const { generateID, getCurrentFormattedDate } = require('../utils/commonUtil');

const ingredientSchema = new mongoose.Schema({
    id: { type: String, default: () => generateID('ING'), unique: true },
    name: { 
        type: String, 
        required: true, 
        maxlength: 50 
    },
    image: { type: String },
    createdAt: { type: String, default: () => getCurrentFormattedDate() }
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;
