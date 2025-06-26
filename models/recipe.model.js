const mongoose = require('mongoose');
const { generateID, getCurrentFormattedDate } = require('../utils/commonUtil');

const recipeSchema = new mongoose.Schema({
    id: { type: String, default: () => generateID('REC'), unique: true },
    title: {
        type: String,
        required: true,
        maxlength: 50
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    instructions: {
        type: String,
        required: true,
        maxlength: 10000
    },
    images: [
        {
            type: String,
            trim: true
        }
    ],
    likes:   { type: Number, default: 0 },
    createdAt: { type: String, default: () => getCurrentFormattedDate() },
    createdBy: { type: String }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
