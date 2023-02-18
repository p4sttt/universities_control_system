const mongoose = require("mongoose");
const { Schema } = mongoose;

const Univer = new Schema({
  title: { type: String, required: true, unique: true },
  url: { type: String, required: true, unique: true },
  isAccessible: { type: Boolean, default: true, require: true, unique: false },
  rating: { type: Number, default: 0.0 },
  ratingCount: { type: Number, default: 0 },
  comments: [
    {
      text: { type: String, required: false, unique: false },
      from: { type: mongoose.Types.ObjectId, require: false, unique: false },
    },
  ],
});

module.exports = mongoose.model("University", Univer);
