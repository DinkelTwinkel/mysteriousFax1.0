const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const frequencySchema = new Schema({
    
  serverID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  channelID: { type: String, required: true, unique: true },
  level: { type: Number, default: 0},

}, { timestamps: true });

const Frequency = mongoose.model('frequency', frequencySchema);
module.exports = Frequency;