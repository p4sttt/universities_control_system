const { validationResult } = require("express-validator");
const University = require("../../models/Univer");
const Application = require("../../models/Application");
const jwt = require("jsonwebtoken");

module.exports = class univeController {
  async getUniversities(req, res) {
    try {
      const universites = await University.find({}, "title url isAccessible");
      res.status(200).json({ universites });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async create(req, res) {
    try {
      const errors = validationResult(req)
      if(!errors.isEmpty()){
        return res.status(400).json({message: "ошибка валидации"})
      }
      const { title, url } = req.body;
      const union = new University({
        title: title,
        url: url,
      });
      await union.save();
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async addApplication(req, res) {
    try {
      const errors = validationResult(req)
      if(!errors.isEmpty()){
        return res.status(400).json({message: "ошибка валидации"})
      }
      const { title, url } = req.body;
      const { token } = req.headers;
      const inUniversityUrl = await University.findOne({ url: url });
      const inUniversityTitle = await University.findOne({ title: title });
      const inApplicationoUrl = await Application.findOne({ url: url });
      const inApplicationoTitle = await Application.findOne({ title: title });
      if (
        inUniversityUrl ||
        inUniversityTitle ||
        inApplicationoUrl ||
        inApplicationoTitle
      ) {
        return res
          .status(400)
          .json({ message: "ЗАЯвка на этот ВУЗ уже отправЛЕНА" });
      }
      const { id } = jwt.decode(token);
      const application = new Application({
        title: title,
        url: url,
        from: id,
      });
      await application.save();
      res.status(200).json({ message: "succces" });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
};
