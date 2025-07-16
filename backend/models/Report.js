const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUser: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    description: String,
    messageContent: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Report', reportSchema); 