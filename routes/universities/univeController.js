const { validationResult } = require("express-validator");
const University = require("../../models/Univer");

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

};
