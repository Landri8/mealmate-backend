const joi = require('joi');
const { sendResponse } = require('../utils/responseHandler');
const authService = require('../services/auth.service');

const register = async (req, res) => {
    try {
        const body = req.body;

        // Joi validation
        const validator = joi.object({
            username: joi.string().min(3).max(30).required(),
            email: joi.string().email().required(),
            password: joi.string().pattern(
                new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")
            ).required().messages({
                "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            }),
            confirmPassword: joi.any().valid(joi.ref('password')).required().messages({
                "any.only": "Passwords do not match"
            })
        });

        const { error } = validator.validate(body);
        if (error) {
            return sendResponse(res, 400, error.details[0].message, null);
        }

        // Call the authService to register the user
        const responseData = await authService.register({
            username: body.username,
            email: body.email,
            password: body.password
        });

        return sendResponse(res, 200, 'Registration successful', responseData);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 400, e.message || "Registeration failed.",
            {
                token: "",
                data: {
                    id: "",
                    name: "",
                    email: "",
                    createdAt: ""
                }
            }
        );
    }
};

const login = async (req, res) => {
    try {
        const body = req.body;

        // Joi validation
        const validator = joi.object({
            email: joi.string().email().required(),
            password: joi.string().regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%#*?&]{8,}$/,
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            ).required()
        });

        const { error } = validator.validate(body);
        if (error) {
            return sendResponse(res, 400, error.details[0].message, null);  // Added `return` to stop execution
        }

        // Call authService for login logic
        const responseData = await authService.login(body);

        return sendResponse(res, 200, 'Login successful', responseData);
    } catch (e) {
        console.error(e);  // Log actual error
        return sendResponse(res, 400, e.message || "Invalid email or password", 
            {
                token: "",
                data: {
                    id: "",
                    name: "",
                    email: "",
                    createdAt: ""
                }
            }
        )
    }
};

const logout = async (req, res) => {
    try {
        const body = req.body;

        const validator = joi.object({
            id: joi.string().required(),
            email: joi.string().email().required(),
        });

        const { error } = validator.validate(body);
        if (error) {
            sendResponse(res, 400, error.details[0].message, null);
        }

        const responseData = await authService.logout(body);

        sendResponse(res, 200, 'Logout successful', responseData);
    } catch (error) {
        sendResponse(res, 400, error.message, null);
    }
}


module.exports = { login, logout, register };