const { validationResult } = require("express-validator");
const University = require("../../models/Univer");

module.exports = class univeController {
  async getUniversities(req, res) {
    try {
      const universitesList = await University.find({}, "title url isAccessible comments rating ratingCount");
      const universities = []
      for(let university of universitesList){
        const {_id, title, url, isAccessible, comments, rating, ratingCount} = university
        const ratinG = rating/ratingCount.length ? rating/ratingCount.length : 0
        universities.push({
          _id: _id,
          title: title,
          url: url,
          isAccessible: isAccessible,
          comments: comments,
          rating: ratinG
        })
      }
      res.status(200).json({ universities });
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
