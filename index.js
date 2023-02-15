const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const schedule = require("node-schedule");
const University = require("./models/Univer")
const { default: axios } = require("axios");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

//роуты
const authRouter = require("./routes/auth/authRouter");
const univerRouter = require("./routes/universities/univerRouter")
app.use("/api/auth", authRouter);
app.use("/api/university", univerRouter)


schedule.scheduleJob("*/1 * * * *", async () => {
  const urls = await University.find({});
  for (const i in urls) {
    const { url, _id } = urls[i];
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
