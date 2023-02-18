const University = require("../../models/Univer");
const Application = require("../../models/Application");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

module.exports = class applicationController {
  async get(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: [...errors] });
      }
      const applications = await Application.find({}, "title url from date");
      res.status(200).json({ applications });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
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
          .json({ message: "Заявка на этот ВУЗ уже отправЛЕНА" });
      }
      const { id, roles } = jwt.decode(token);
      const application = new Application({
        title: title,
        url: url,
        from: {
          id: id,
          roles: roles,
        },
      });
      await application.save();
      res.status(200).json({ message: "succces" });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async distribute(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { applicationId, add } = req.body;
      const { title, url } = await Application.findByIdAndDelete(applicationId)
      if (add) {
        const university = new University({
          title: title,
          url: url,
        });
        await university.save();
      }
      res.status(200).json({message: "Успех"})
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
};
