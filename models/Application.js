const mongoose = require("mongoose");
const { Schema } = mongoose;

const Application = new Schema({
  title: { type: String, required: true, unique: true },
  url: { type: String, required: true, unique: true },
  from: {
    id: { type: mongoose.Types.ObjectId, required: true, unique: false },
    roles: [{ type: String, required: true, unique: false }],
  },
  date: {type: Date, default: Date.now()}
});

module.exports = mongoose.model("Application", Application);
