const express = require('express');
const router = express.Router();

const messagingController = require('../controllers/aegis-messaging-controller');

router.get('/messaging', messagingController.messaging);

router.get('/callsign', messagingController.callsignLookup);

router.post('/send', messagingController.postMessaging);

router.get('/getmessages', messagingController.getMessages);

router.get('/destroy', messagingController.destroyRecord);

module.exports = router;