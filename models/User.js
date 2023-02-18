const mongoose = require("mongoose");
const { Schema } = mongoose;

const User = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: false },
  password: { type: String, required: true, unique: false },
  notifications: { type: Boolean, default: true },
  telegram: {
    conconnected: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
    chatId: { type: String, default: null },
  },
  roles: [{ type: String, ref: "Role" }],
});

module.exports = mongoose.model("User", User);
