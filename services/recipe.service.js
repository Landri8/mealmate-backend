const Recipe = require('../models/recipe.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const RecipeIngredient = require('../models/recipeIngredient.model');
const Ingredient = require('../models/ingredient.model');
const mongoose = require('mongoose');
const { uploadImages } = require('../utils/cloudinaryUtil');
const cloudinary = require('cloudinary').v2

async function createRecipe(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            recipe_id,
            title,
            instructions,
            images,       // mix of URLs & base64
            ingredients,
            category: catId,
            userId
        } = data;

        // 1️⃣ Resolve category
        console.log("CAAAA",catId)
        const categoryDoc = await Category.findOne({ title: catId });
        console.log("CAAAA",categoryDoc)
        if (!categoryDoc) throw new Error('Category not found');

        let recipe;
        let finalImages = [];

        if (recipe_id) {
            // —— UPDATE PATH ——
            recipe = await Recipe.findOne({ id: recipe_id }).session(session);
            if (!recipe) throw new Error('Recipe not found');
            if (recipe.createdBy !== userId) throw new Error('Not authorized');

            // a) Determine which old URLs to keep
            const keepUrls = images.filter(img => !img.startsWith('data:image/'));

            // b) Determine which old URLs to remove
            const removeUrls = recipe.images.filter(url => !keepUrls.includes(url));
            // delete them from Cloudinary
            await Promise.all(removeUrls.map(url => {
                const publicId = url
                    .split('/')
                    .slice(-2)
                    .join('/')
                    .replace(/\.[^/.]+$/, '');
                return cloudinary.uploader.destroy(publicId);
            }));

            // c) Upload new base64 images
            const newBase64s = images.filter(img => img.startsWith('data:image/'));
            const uploadedNewUrls = newBase64s.length
                ? await uploadImages(newBase64s)
                : [];

            // d) Merge kept + new
            finalImages = [...keepUrls, ...uploadedNewUrls];

            // e) Apply to recipe
            recipe.title = title;
            recipe.instructions = instructions;
            recipe.images = finalImages;
            recipe.category = categoryDoc._id;
            await recipe.save({ session });

            // f) Clear old ingredient links
            await RecipeIngredient.deleteMany(
                { recipeId: recipe._id },
                { session }
            );
        } else {
            // —— CREATE PATH ——
            finalImages = images.length
                ? await uploadImages(images)
                : [];

            recipe = new Recipe({
                title,
                instructions,
                images: finalImages,
                category: categoryDoc._id,
                createdBy: userId
            });
            await recipe.save({ session });
        }

        // 2️⃣ Validate ingredient IDs
        const incomingIds = ingredients.map(i => i.ingredientId);
        const foundIngredients = await Ingredient.find({ id: { $in: incomingIds } });
        if (foundIngredients.length !== incomingIds.length) {
            throw new Error('One or more ingredients do not exist');
        }

        // 3️⃣ Insert new junction docs
        const junctions = ingredients.map(({ ingredientId, quantity, unit }) => {
            const ing = foundIngredients.find(i => i.id === ingredientId);
            return {
                recipeId: recipe._id,
                ingredientId: ing._id,
                quantity,
                unit
            };
        });
        await RecipeIngredient.insertMany(junctions, { session });

        await session.commitTransaction();
        session.endSession();

        return {
            recipe,
            images: finalImages,
            ingredients: junctions
        };
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}

async function getRecipeDetail(recipeId) {
    // 1️⃣ Find the recipe by custom id
    const recipe = await Recipe
        .findOne({ id: recipeId })
        .select('-__v')    // drop version
        .lean();

    if (!recipe) {
        throw new Error('Recipe not found');
    }

    // 2️⃣ Resolve the category custom-id → keep its id string
    const categoryDoc = await Category
        .findById(recipe.category)
        .select('id title')
        .lean();
    const category = categoryDoc ? categoryDoc.title : null;

    // 3️⃣ Fetch creator’s user data
    const userDoc = await User
        .findOne({ id: recipe.createdBy })
        .select('id name email createdAt -_id')
        .lean();
    // userDoc will be null if the user was deleted, you can handle that as needed

    // 4️⃣ Fetch all ingredient links for this recipe
    const links = await RecipeIngredient
        .find({ recipeId: recipe._id })
        .select('-_id -__v -recipeId')
        .lean();

    // 5️⃣ Fetch each Ingredient master record
    const ingredients = await Promise.all(links.map(async link => {
        const ing = await Ingredient
            .findById(link.ingredientId)
            .select('id name image -_id')
            .lean();

        return {
            id: ing.id,
            name: ing.name,
            image: ing.image,
            quantity: link.quantity,
            unit: link.unit
        };
    }));

    // 6️⃣ Assemble final payload
    return {
        id: recipe.id,
        title: recipe.title,
        category,                      // e.g. "CAT7db..."
        instructions: recipe.instructions,
        images: recipe.images,
        likes: recipe.likes,
        createdAt: recipe.createdAt,
        createdBy: userDoc,         // now an object { id, name, email, createdAt }
        ingredients
    };
}

async function deleteRecipe(recipeId, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Find and authorize
    const recipe = await Recipe.findOne({ id: recipeId }).session(session);
    if (!recipe) throw new Error('Recipe not found');
    if (recipe.createdBy !== userId) throw new Error('Not authorized');

    // 2️⃣ Delete images from Cloudinary
    const toDelete = recipe.images || [];
    await Promise.all(toDelete.map(url => {
      // derive public_id (assuming folder/filename structure)
      const parts = url.split('/');
      const folder = parts[parts.length - 2];
      const filename = parts[parts.length - 1].split('.').shift();
      const publicId = `${folder}/${filename}`;
      return cloudinary.uploader.destroy(publicId);
    }));

    // 3️⃣ Remove junction entries
    await RecipeIngredient.deleteMany(
      { recipeId: recipe._id },
      { session }
    );

    // 4️⃣ Delete the recipe
    await Recipe.deleteOne(
      { _id: recipe._id },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

module.exports = {
    createRecipe,
    getRecipeDetail,
    deleteRecipe
};
