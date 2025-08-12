const express = require('express');
const router = express.Router();

const messagingController = require('../controllers/aegis-messaging-controller');

router.get('/messaging', messagingController.messaging);

module.exports = router;