const mongoose = require("mongoose");
const { Schema } = mongoose;

const User = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: false },
  password: { type: String, required: true, unique: false },
  conconnectedTelegram: { type: Boolean, default: false },
  chatId: { type: String, default: null },
  roles: [{ type: String, ref: "Role" }],
});

module.exports = mongoose.model("User", User);
