const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { validateAuthUser } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/logout', validateAuthUser, authController.logout);


module.exports = router;