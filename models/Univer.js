const mongoose = require("mongoose");
const { Schema } = mongoose;

const Log = new Schema({
  status: { type: String, require: false },
  text: { type: String, required: false },
  date: { type: Date, default: Date.now },
});

const Univer = new Schema({
  title: { type: String, required: true, unique: true },
  url: { type: String, required: true, unique: true },
  isAccessible: { type: Boolean, default: true, require: true, unique: false },
  logs: [
    {
      status: { type: String, require: false },
      text: { type: String, required: false },
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("University", Univer);
