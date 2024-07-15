const { model, Schema } = require('mongoose');

const ChatMessageSchema = new Schema({
    username: String,
    message: String,
}, {
    timestamps: true,
    versionKey:false
})



module.exports = model('chat-message', ChatMessageSchema);