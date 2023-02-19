const TelegramApi = require("node-telegram-bot-api");
const University = require("./models/Univer");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const bot = new TelegramApi(process.env.TELEGRAM_BOT, { polling: true });
console.log("bot working")

const toString = ({ title, url, isAccessible }) => {
  return `Университет: [${title}](${url})\nДоступен: ${
    isAccessible ? "✅" : "🚫"
  }\n \n`;
};

const sendNotify = async (university, isWorkingNow) => {
  for (let id of university.subscribers) {
    const user = await User.findById(id);
    if (user.telegram.connected && user.telegram.notifications) {
      if (isWorkingNow) {
        await bot.sendSticker(
          user.telegram.chatId,
          "https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/192/22.webp"
        );
        return await bot.sendMessage(
          user.telegram.chatId,
          `Cайт ВУЗа [${university.title}](${university.url}) возобновил свою работу`,
          { parse_mode: "Markdown" }
        );
      } else {
        await bot.sendSticker(
          user.telegram.chatId,
          "https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/23.webp"
        );
        return await bot.sendMessage(
          user.telegram.chatId,
          `К сожалению сайт ВУЗа [${university.title}](${university.url}) временно не работает`,
          { parse_mode: "Markdown" }
        );
      }
    }
  }
};

const attackNotify = async () => {
  const users = await User.find({
    "telegram.connected": true,
    "telegram.notifications": true,
  });
  for (let user of users) {
    await bot.sendSticker(
      user.telegram.chatId,
      "https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/12.webp"
    );
    return await bot.sendMessage(
      user.telegram.chatId,
      "Происходит ддос атака на сайты ВУЗов"
    );
  }
};

bot.setMyCommands([
  { command: "/start", description: "lkzsjernfdlksjdv" },
  { command: "/universities", description: "доступность университетов" },
  { command: "/auth", description: "Авторизация" },
  { command: "/cancelnotifications", description: "Отключить оповещение" },
  { command: "/setnotifications", description: "Включить оповещение" },
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
      if (user.telegram.connected) {
        return await bot.sendMessage(
          chat.id,
          "У этого пользователся уже подключен telegram"
        );
      }
      const hashPassword = user.password;
      const validPassword = bcrypt.compareSync(password, hashPassword);
      if (validPassword) {
        user.telegram.chatId = chat.id;
        user.telegram.connected = true;
        await user.save();
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
  if (text === "/cancelnotifications") {
    const user = await User.findOneAndUpdate({ "telegram.chatId": chat.id });
    if (user.telegram.connected) {
      user.telegram.notifications = false;
      await user.save();
      return bot.sendMessage(chat.id, "Уведомления отключены");
    }
    return bot.sendMessage(
      chat.id,
      "Вы не подключили свой телеграм аккаунт, что бы это сделать нипишите `/auth Email Password`"
    );
  }
  if (text === "/setnotifications") {
    const user = await User.findOneAndUpdate({ "telegram.chatId": chat.id });
    if (user.telegram.connected) {
      user.telegram.notifications = true;
      await user.save();
      return bot.sendMessage(chat.id, "Уведомления включены");
    }
    return bot.sendMessage(
      chat.id,
      "Вы не подключили свой телеграм аккаунт, что бы это сделать нипишите `/auth Email Password`"
    );
  }
  return await bot.sendMessage(chat.id, "Я не знаю такой команды");
});

exports.bot = bot;
exports.sendNotify = sendNotify;
exports.attackNotify = attackNotify;
