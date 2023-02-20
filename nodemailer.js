const nodemailer = require("nodemailer");
const User = require("./models/User");

const transporter = nodemailer.createTransport(
  {
    host: "smtp.mail.ru",
    port: 465,
    secure: true,
    auth: {
      user: "genadiy.gorin.2024@list.ru",
      pass: "kttyLtK5zjb0LrEkuySJ",
    },
  },
  {
    from: "University Controller <genadiy.gorin.2024@list.ru>",
  }
);

const sendEmail = (options) => transporter.sendMail(options);

const notifyEmail = async (university, isWorkingNow) => {
  for (let id of university.subscribers) {
    try {
      const user = await User.findById(id);
      if (user.notifications) {
        if (isWorkingNow) {
          return sendEmail({
            to: user.email,
            subject: "Сайт ВУЗа возобновил свою работу",
            text: `Сайт ВУЗа ${university.title} возобновил свою работу`,
          });
        } else {
          return sendEmail({
            to: user.email,
            subject: "Сайт ВУЗа временно прекратил свою работу",
            text: `К сожалению сайт ВУЗа ${university.title} временно прекратил свою работу свою работу`,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
};

const attackEmail = async () => {
  try {
    const users = await User.find({ notifications: true });
    for (let user of users) {
      return sendEmail({
        to: user.email,
        subject: "Сайты вузов подверглись атаке",
        text: "К сожалению сайты ВУЗов подверглись ддос атаке и временно не работают",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.notifyEmail = notifyEmail;
exports.attackEmail = attackEmail;
