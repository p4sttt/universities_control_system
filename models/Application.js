const mongoose = require("mongoose");
const { Schema } = mongoose;

const Application = new Schema({
  title: { type: String, required: true, unique: true },
  url: { type: String, required: true, unique: true },
  from: {type: mongoose.Types.ObjectId, require: true, unique: false}
});

module.exports = mongoose.model("Application", Application);