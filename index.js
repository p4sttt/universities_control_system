const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const schedule = require("node-schedule");
const University = require("./models/Univer");
const { default: axios } = require("axios");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const job = schedule.scheduleJob("*/1 * * * *", async () => {
  const urls = await University.find({});
  for (const i in urls) {
    const { url, _id } = urls[i];
    axios.get(url).catch(async (res) => {
      console.log(res);
      await University.findByIdAndUpdate(_id, {
        $set: { isAccessible: false },
      });
    });
  }
});

app.get("/api/unions", async (req, res) => {
  try {
    const universites = await University.find({}, "title url isAccessible");
    res.status(200).json({ universites });
  } catch (error) {
    res.status(500).json({ message: "Oh... something went wrong" });
  }
});

app.post("/api/union", async (req, res) => {
  try {
    const { title, url } = req.body;
    const union = new University({
      title: title,
      url: url,
    });
    await union.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false });
  }
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
