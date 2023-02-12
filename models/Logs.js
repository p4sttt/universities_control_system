const mongoose = require("mongoose");
const { Schema } = mongoose;

const Log = new Schema({
  title: { type: String, require: false },
  text: { type: String, required: false },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", Log);
