const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Role = require("../../models/Role");
const User = require("../../models/User");
const University = require("../../models/Univer");
const Comment = require("../../models/Comment");

module.exports = class authController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors });
      }
      const { email, name, password } = req.body;
      const candidate = await User.findOne({ email: email });
      if (candidate) {
        return res.status(400).json({ message: "Пользователь уже существует" });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const { value } = await Role.findOne({ value: "USER" });
      const user = new User({
        name: name,
        email: email,
        password: hashPassword,
        roles: [value],
      });
      await user.save();
      const id = user._id;
      const roles = user.roles;
      const nameU = user.name;
      const token = jwt.sign(
        { name: nameU, id: id, roles: roles },
        process.env.JWT_KEY,
        {
          expiresIn: "48h",
        }
      );
      await University.updateMany({}, { $push: { subscribers: id } });
      return res.status(200).json({ token: token, name: nameU, roles });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ message: "пользователь не найден" });
      }
      const userPassword = user.password;
      const validPassword = bcrypt.compareSync(password, userPassword);
      if (!validPassword) {
        res.status(400).json({ message: "неверный логин или пароль" });
      }
      const id = user._id;
      const roles = user.roles;
      const nameU = user.name;
      const token = jwt.sign(
        { name: nameU, id: id, roles: roles },
        process.env.JWT_KEY,
        {
          expiresIn: "48h",
        }
      );
      return res.status(200).json({ token: token, name: nameU, roles });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async addAdminPermission(req, res) {
    try {
      const id = req.body.id;
      await User.findByIdAndUpdate(id, {
        $set: { roles: ["ADMIN"] },
      });
      res.status(200).json({ message: "успех" });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async setNotifications(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { set } = req.body;
      const { token } = req.headers;
      const { id } = jwt.decode(token);

      await User.findByIdAndUpdate(id, { $set: { notifications: set } });
      return res.status(200).json({ message: "успех" });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async subscribe(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { universityId } = req.body;
      const { token } = req.headers;
      const { id } = jwt.decode(token);

      const university = await University.findById(universityId);
      if (!university.subscribers.includes(id)) {
        university.subscribers.push(id);
        await university.save();
        return res.status(200).json({ message: "успех" });
      }
      return res.status(400).json({ message: "вы уже подписаны на этот ВУЗ" });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async unsubscribe(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { universityId } = req.body;
      const { token } = req.headers;
      const { id } = jwt.decode(token);

      const university = await University.findById(universityId);
      if (university.subscribers.includes(id)) {
        const i = university.subscribers.indexOf(id);
        university.subscribers.splice(i, 1);
        await university.save();
        return res.status(200).json({ message: "успех" });
      }
      return res.status(400).json({ message: "вы не подписаны на ВУЗ" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async getSubscribes(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { token } = req.headers;
      const { id } = jwt.decode(token);
      const universities = await University.find(
        {
          subscribers: { $in: [id] },
        },
        "title url isAccessible"
      );
      return res.status(200).json({ universities });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async comment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { text, universityId } = req.body;
      const { token } = req.headers;
      const { id } = jwt.decode(token);

      const comment = new Comment({
        text: text,
        from: id,
        universityId: universityId,
      });
      await comment.save();
      return res.status(200).json({ message: "успех" });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async getComments(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { universityId } = req.body;

      const comments = await Comment.find({
        _id: universityId,
        verified: true,
      });
      return res.status(200).json({ comments });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async getAllComments(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { universityId } = req.body;

      const comments = await Comment.find({ _id: universityId });
      return res.status(200).json({ comments });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async checkComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { commentId, set } = req.body;

      const comment = await Comment.findById(commentId);
      if (set) {
        comment.verified = true;
        await comment.save();
      } else {
        await comment.delete();
      }
      return res.status(200).json({ message: "успех" });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async rarting(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { rating, universityId } = req.body;
      const { id } = jwt.decode(req.headers.token);

      const university = await University.findById(universityId);
      if (!university.ratingCount.includes(id)) {
        university.ratingCount.push(id);
        university.rating += rating;
        await university.save();
        return res.status(200).json({ message: "успех" });
      }
      return res.status(400).json({ message: "вы уже оставили отзыв" });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
  async gerRating(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
      }
      const { universityId } = req.body;
      const { rating, ratingCount } = await University.findById(universityId);
      const ratingRes = rating / ratingCount ? rating / ratingCount : 0;

      return res.status(200).json({ rating: ratingRes });
    } catch (error) {}
  }
};
