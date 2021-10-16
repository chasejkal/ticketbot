const mongoose = require('mongoose')

module.exports = mongoose.model('Blacklists', new mongoose.Schema({
    guild_id: { type: String, required: true },
    user_id: { type: String, required: true },
    reason: { type: String, default: "None" }
}, { versionKey: false }))