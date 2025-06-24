const cloudinary = require('../config/cloudinary');

const uploadImages = async (base64Images, folder = 'recipes') => {
    const uploadPromises = base64Images.map(base64 => 
        cloudinary.uploader.upload(base64, { folder })
    );

    const results = await Promise.all(uploadPromises);

    return results.map(result => result.secure_url);
};

module.exports = {
    uploadImages
};