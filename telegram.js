const TelegramApi = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const University = require("./models/Univer");
require("dotenv").config();

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URI, () => {
  console.log("bot working");
  console.log("db connected");
});

const toString = ({ title, url, isAccessible }) => {
  return `Университет: [${title}](${url})\nДоступен: ${
    isAccessible ? "✅" : "🚫"
  }\n \n`;
};

const bot = new TelegramApi(process.env.TELEGRAM_BOT, { polling: true });
bot.on("message", async (msg) => {
  const { text, chat } = msg;
  if (text === "/universities") {
    const universites = await University.find({}, "title url isAccessible");
    let message = "";
    for (const i in universites) {
      message = message + toString(universites[i]);
    }
    bot.sendMessage(chat.id, message, {
      parse_mode: "Markdown"
    });
  }
  bot.sendMessage(chat.id, text);
});
