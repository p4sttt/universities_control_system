const mongoose = require("mongoose");
const { Schema } = mongoose;

const Comment = new Schema({
  text: { type: String, required: true, unique: false },
  from: { type: mongoose.Types.ObjectId, require: true, unique: false },
  universityId: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: false,
  },
  date: { type: Date, default: Date.now() },
  verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Comment", Comment);
