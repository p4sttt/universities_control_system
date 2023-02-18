const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const schedule = require("node-schedule");
const nodemailer = require("nodemailer");
const University = require("./models/Univer");
const User = require("./models/User");
const { default: axios } = require("axios");
const { sendNotify } = require("./telegram");

require("dotenv").config();

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

//роуты
const authRouter = require("./routes/auth/authRouter");
const univerRouter = require("./routes/universities/univerRouter");
const applicationRouter = require("./routes/applications/applicationsRouter");
app.use("/api/auth", authRouter);
app.use("/api/university", univerRouter);
app.use("/api/application", applicationRouter);

async function sendMail({ title }) {
  const mailsDB = await User.find({}, "email");
  let mails = [];
  for (let mail in mailsDB) {
    mails.push(mail.email);
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: "587",
    secure: false,
    auth: {
      user: "universitycontrolsystem@gmail.com",
      pass: "X3C-zgP-b5N-2t6",
    },
  });
  const mailOptions = {
    from: "universitycontrolsystem@gmail.com",
    to: mails,
    subject: "Сайт университета временно недоступен",
    text: `сайт университета ${title} временно недоступен`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log(f`mail send ${info.response}`);
    }
  });
}

schedule.scheduleJob("*/1 * * * *", async () => {
  const universites = await University.find({});
  for (let university of universites) {
    const { url, _id } = university;
    axios
      .get(url)
      .then(async (res) => {
        await University.findByIdAndUpdate(_id, {
          $set: { isAccessible: true },
        });
      })
      .catch(async (res) => {
        await University.findByIdAndUpdate(_id, {
          $set: { isAccessible: false },
        });
        // sendNotify(university)
        // sendMail(university)
      });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({ success: true });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DB_URI, () => {
      console.log("db connected");
    });
    console.log("server started on port", PORT);
  } catch (error) {
    console.log(error);
  }
});
