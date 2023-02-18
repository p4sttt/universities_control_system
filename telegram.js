const TelegramApi = require("node-telegram-bot-api");
const University = require("./models/Univer");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const bot = new TelegramApi(process.env.TELEGRAM_BOT, { polling: true });

const toString = ({ title, url, isAccessible }) => {
  return `Университет: [${title}](${url})\nДоступен: ${
    isAccessible ? "✅" : "🚫"
  }\n \n`;
};

bot.setMyCommands([
  { command: "/start", description: "lkzsjernfdlksjdv" },
  { command: "/universities", description: "доступность университетов" },
  { command: "/auth", description: "Авторизация" },
]);

bot.on("message", async (msg) => {
  const { text, chat } = msg;
  if (text === "/start") {
    await bot.sendSticker(
      chat.id,
      "https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/1.webp"
    );
    return await bot.sendMessage(
      chat.id,
      "**Добро пожаложвать!**\n \nНапишите `/auth Email Password` чтобы авторизоваться\n \nИли просто напишите `/universities` чтобы посмотреть информация о работоспособности ВУЗов",
      {
        parse_mode: "Markdown",
      }
    );
  }
  if (text === "/universities") {
    const universites = await University.find({}, "title url isAccessible");
    let message = "";
    for (const i in universites) {
      message = message + toString(universites[i]);
    }
    return await bot.sendMessage(chat.id, message, {
      parse_mode: "Markdown",
    });
  }
  if (text.split(" ")[0] === "/auth") {
    const email = text.split(" ")[1];
    const password = text.split(" ")[2];
    const user = await User.findOne({ email: email });
    if (user) {
      if (user.conconnectedTelegram) {
        return await bot.sendMessage(
          chat.id,
          "У этого пользователся уже подключен telegram"
        );
      }
      const hashPassword = user.password;
      const validPassword = bcrypt.compareSync(password, hashPassword);
      if (validPassword) {
        const id = user._id;
        await User.findByIdAndUpdate(id, {
          $set: { conconnectedTelegram: true, chatId: chat.id },
        });
        await bot.sendMessage(chat.id, "Авторизация прошла успешно");
        return await bot.sendMessage(
          chat.id,
          "Теперь вы будете получать уведомленя, если сайт одного из ВУЗов перестанет работать\n \nЧтобы отказаться от оповещений напишите `/cancelnotifications`",
          { parse_mode: "Markdown" }
        );
      }
      return await bot.sendMessage(chat.id, "Неверная почта или пароль");
    }
    return await bot.sendMessage(chat.id, "Такого пользователся не существует");
  }
  return await bot.sendMessage(chat.id, "Я не знаю такой команды");
});

exports.bot = bot;
