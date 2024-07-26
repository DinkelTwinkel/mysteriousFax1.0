const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const frequencySchema = new Schema({
    
  serverID: { type: String, required: true, unique: false },
  name: { type: String, required: false },
  channelID: { type: String, required: true, unique: false },
  threadMessageID: { type: String, required: false, unique: true },
  level: { type: Number, default: 0},

}, { timestamps: true });

const Frequency = mongoose.model('frequency', frequencySchema);
module.exports = Frequency;