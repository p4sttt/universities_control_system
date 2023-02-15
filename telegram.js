const TelegramApi = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const University = require("./models/Univer");
const TelegramUser = require("./models/TelegramUser");
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
  const candidate = await TelegramUser.findOne({chat: chat.id})
  if(!candidate){
    const telegramUser = new TelegramUser({
      username: chat.username,
      chat: chat.id
    })
    await telegramUser.save()
  }
  if (text === "/universities") {
    const universites = await University.find({}, "title url isAccessible");
    let message = "**Университеты, которые мы знаем:**\n \n";
    for (const i in universites) {
      message = message + toString(universites[i]);
    }
    await bot.sendMessage(chat.id, message, {
      parse_mode: "MarkdownV2"
    });
  }
});

async function sendNotify({title, url}) {
  const chats = TelegramUser.find({}, "chat")
  for(const chat of chats){
    await bot.sendMessage(chat, `Университет: [${title}](${url}) временно не доступен`)
  }
}

exports.sendNotify = sendNotify
