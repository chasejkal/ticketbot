const mongoose = require('mongoose')

module.exports = mongoose.model('Statistics', new mongoose.Schema({
    user: { type: String, required: true },
    guild: { type: String, required: true },
    messages: { type: Array }
}, { versionKey: false }))
