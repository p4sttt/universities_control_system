const mongoose = require("mongoose")
const {Schema} = mongoose

const TelegramUser = new Schema({
  username: {type: String, require: true, unique: true},
  chat: {type: String, require: true, unique: true}
})

module.exports = mongoose.model("TelegramUser", TelegramUser);