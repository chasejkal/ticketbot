const mongoose = require('mongoose')

module.exports = mongoose.model('Tickets', new mongoose.Schema({
    /* Initian Data */
    guild: { type: String },
    channel: { type: String },
    channelName: { type: String },
    message: { type: String },
    creator: { type: String },
    reason: { type: String, default: "None" },
    addedUsers: { type: Array },

    /* Closing Data */
    closedAt: { type: String },
    closedBy: { type: String },
    closedReason: { type: String, default: "None" },
    trapscript: { type: String }
    
}, { versionKey: false }))