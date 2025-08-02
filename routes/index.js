const express = require('express');
const router = express.Router();
const homeController = require('../controllers/aegis-core-controller');

router.get('/', homeController.getHome);

module.exports = router;