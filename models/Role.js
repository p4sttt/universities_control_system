const mongoose = require("mongoose")
const {Schema} = mongoose

const Role = new Schema({
  value: {type: String, unique: true, default: "USER"}
})

module.exports = mongoose.model("Role", Role);