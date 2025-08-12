const controller = {};

controller.messaging = (req, res) => res.render('messaging/messaging', { title: 'AEGIS Messaging', message: 'Welcome to the AEGIS Messaging page.' });

module.exports = controller;