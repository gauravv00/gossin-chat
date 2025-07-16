const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true,
        enum: ['gossip', 'confession', 'opinion']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);
