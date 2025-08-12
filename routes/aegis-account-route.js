const express = require('express');
const router = express.Router();
const accountController = require('../controllers/aegis-account-controller');
const messagingController = require('../controllers/aegis-messaging-controller');

const messagingRouter = require('./aegis-messaging-route');

router.get('/login', accountController.login);
router.post('/login', accountController.loginPost);

router.get('/registration', accountController.register);
router.post('/registration', accountController.registerPost);

router.get('/profile', accountController.profile);
router.post('/profile', accountController.updateProfile);

router.post('/password', accountController.updatePassword);

router.get('/logout', accountController.logout);

const isAuthenticated = (req, res, next) => { if (req.session.account_id) { next(); } else { res.redirect('/account/login'); } };

router.get('/messaging', isAuthenticated, messagingController.messaging);
router.use('/messaging', messagingRouter);



module.exports = router;