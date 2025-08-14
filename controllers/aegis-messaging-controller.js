const messageModel = require('../models/aegis-messaging-model');

const controller = {};

controller.messaging = (req, res) => 
    res.render('messaging/messaging', 
    { title: 'AEGIS Messaging', message: 'Welcome to the AEGIS Messaging page.', account_email: req.session.account_email });


controller.postMessaging = async (req, res) => {
    const { source_id, destination_id, message } = req.body;

    try {
        const newMessage = await messageModel.postMessage({ source_id, destination_id, message });
        res.json({ success: true, message: 'Message sent successfully', data: newMessage });
    } catch (error) {
        console.error('Error posting message:', error);
        res.status(500).json({ success: false, message: 'Error sending message' });
    }
}

controller.getMessages = async (req, res) => {
    const { source_id, destination_id } = req.query;

    try {
        const messages = await messageModel.getMessages({ destination_id, source_id });
        res.json({ success: true, data: messages });
    } catch (error) {

        res.json({ success: false, message: 'No New Messages' });
    }
}

controller.callsignLookup = async (req, res) => {
    const callsign = req.query.callsign;
    if (!callsign) {
        return res.json({success: false, message: 'Callsign is required'});
    }
    
    try {
        const keys = await messageModel.getCallsignKeys(callsign);

        if (!keys) {
            return res.json({success: false, message: 'Callsign keys not found'});
        }

        res.json({success: true, rsa_public_key: keys.rsa_public_key});
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.json({success: false, message: 'Error fetching callsign keys'});
    }   
}

controller.destroyRecord = async (req, res) => {
    const message_id = req.query.message_id;

    if (!message_id) {
        return res.json({success: false, message: 'Message ID is required'});
    }

    try {
        await messageModel.destroyRecord(message_id);
        res.json({success: true, message: 'Message record destroyed successfully'});
    } catch (error) {
        console.error('Error destroying record:', error);
        res.json({success: false, message: 'Error destroying message record'});
    }
    
}

module.exports = controller;