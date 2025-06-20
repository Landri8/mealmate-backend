const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const { getCurrentFormattedDateTime } = require('../utils/commonUtil');
const { generateToken } = require('../utils/jwtUtil');
const { verifyPassword } = require('../utils/passwordUtil');
const { setCache, getCache, deleteCache } = require('../utils/redisUtil');

const register = async (body) => {
    try {
        const email = body.email.toLowerCase();

        // Check if email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);

        // Create new user
        const newUser = new userModel({
            name: body.username,
            email: email,
            password: hashedPassword
        });

        await newUser.save();

        // Generate access token
        const accessToken = generateToken({
            userId: newUser.id,
            email: newUser.email,
        }, '7d');

        return {
            token: accessToken,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                createdAt: newUser.createdAt
            }
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const login = async (body) => {
    try {
        const user = await userModel.findOne({ email: body.email.toLowerCase() });

        if (!user) {
            throw new Error('User not found');
        }

        // Prevent multiple logins
        
        // if (user.id !== "USR000000001") {
        //     const loggedAt = await getCache(user.id);
        //     if (loggedAt) {
        //         throw new Error('Already logged in!');
        //     }
        // }

        const isPasswordValid = await verifyPassword(body.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        const accessToken = generateToken({
            userId: user.id,
            email: user.email,
        }, '7d');

        await setCache(user.id, {
            loggedAt: getCurrentFormattedDateTime(),
        });

        return {
            token: accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const logout = async (body) => {
    try {
        const user = await userModel.findOne({ email: body.email });

        if (!user || user.id !== body.id) {
            throw new Error('User not found');
        }

        const loggedAt = await getCache(user.id);
        if (!loggedAt) {
            throw new Error('User is not logged in!');
        }

        await deleteCache(user.id);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    login,
    logout,
    register
};
