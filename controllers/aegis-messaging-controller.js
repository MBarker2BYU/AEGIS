const controller = {};

controller.messaging = (req, res) => 
    res.render('messaging/messaging', 
    { title: 'AEGIS Messaging', message: 'Welcome to the AEGIS Messaging page.' });


controller.messagingPost = (req, res) => {
    console.log('New message:', req.body);
    // Simulate saving the message
    res.redirect('/account/messaging');
}

controller.getMessages = (req, res) => {
    console.log('Fetching messages for user:', req.session.user);
    // Simulate fetching messages
    const messages = [
        { id: 1, text: 'Hello from AEGIS!', user: 'System' },
        { id: 2, text: 'Your profile has been updated.', user: 'System' }
    ];
    res.render('messaging/messages', { title: 'AEGIS Messages', messages });
}

module.exports = controller;