const pool = require("../database/")

const model = {}

model.getMessagesForCallsign = (callsign) => {
    return pool.query(
        'SELECT m.* FROM messages m join account act on m.user_id = act.id WHERE act.account_email = $1 ORDER BY m.timestamp DESC',
        [callsign]
    ).then(result => result.rows)
        .catch(error => {
        console.error("Error fetching messages for callsign:", error);
        throw new Error("Could not fetch messages");
        });
}

model.getCallsignKeys = async (callsign) => {

    try
    {
        const result = await pool.query(
        'SELECT rsa_public_key FROM account where account_email = $1',
        [callsign])

        return result.rows[0];
    }
    catch (error)
    {
        console.error("Error fetching callsign keys:", error);
        throw new Error("Could not fetch callsign keys");
    }    
}

model.postMessage = async (messageData) => {
    try {
        const result = await pool.query(
            'INSERT INTO messages (source_id, destination_id, message) VALUES ($1, $2, $3) RETURNING *',
            [messageData.source_id, messageData.destination_id, messageData.message]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error posting message:", error);
        throw new Error("Could not post message");
    }
}


model.getMessages = async ({ source_id, destination_id }) => {
    try {
        const result = await pool.query(
            'SELECT * FROM messages WHERE source_id = $1 AND destination_id = $2',
            [source_id, destination_id]
        );
        return result.rows;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Could not fetch messages");
    }
}

model.destroyRecord = async (message_id) => {
    try {
        await pool.query(
            'DELETE FROM messages WHERE message_id = $1',
            [message_id]
        );
    } catch (error) {
        console.error("Error destroying record:", error);
        throw new Error("Could not destroy record");
    }
}

module.exports = model;