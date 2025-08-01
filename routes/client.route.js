const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');

router.post('/', clientController.getHomeData);

module.exports = router;