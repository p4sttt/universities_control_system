const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const schedule = require("node-schedule");
const University = require("./models/Univer");
const { default: axios } = require("axios");
const { sendNotify, attackNotify } = require("./telegram");
const { notifyEmail, attackEmail } = require("./nodemailer");

require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

//роуты
const authRouter = require("./routes/auth/authRouter");
const univerRouter = require("./routes/universities/univerRouter");
const applicationRouter = require("./routes/applications/applicationsRouter");
app.use("/api/auth", authRouter);
app.use("/api/university", univerRouter);
app.use("/api/application", applicationRouter);

//воркеры
let count = 0;
schedule.scheduleJob("* * */24 * *", async () => {
  console.log(Date.now());
});
schedule.scheduleJob("*/1 * * * *", async () => {
  const universites = await University.find({});
  for (let university of universites) {
    const { url, _id } = university;
    const isAccessibleLast = university.isAccessible;
    await axios
      .get(url)
      .then(async (res) => {
        await University.findByIdAndUpdate(_id, {
          $set: { isAccessible: true },
        });
        if (isAccessibleLast == false) {
          sendNotify(university, true);
          notifyEmail(university, true);
        }
      })
      .catch(async (res) => {
        await University.findByIdAndUpdate(_id, {
          $set: { isAccessible: false },
        });
        if (isAccessibleLast == true) {
          sendNotify(university, false);
          notifyEmail(university, false);
          count += 1;
        }
      });
  }
  if (count >= universites.length / 4) {
    attackNotify();
    attackEmail();
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
