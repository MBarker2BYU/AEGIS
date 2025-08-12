const express = require('express');
const router = express.Router();
const accountController = require('../controllers/aegis-account-controller');
const messagingController = require('../controllers/aegis-messaging-controller');

const messagingRouter = require('./aegis-messaging-route');

router.get('/login', accountController.login);
router.post('/login', accountController.loginPost);

const isAuthenticated = (req, res, next) => { if (req.session.user) { next(); } else { res.redirect('/account/login'); } };

router.get('/messaging', isAuthenticated, messagingController.messaging);
router.use('/messaging', messagingRouter);

module.exports = router;