const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Role = require("../../models/Role");
const User = require("../../models/User");
const University = require("../../models/Univer");

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
      const token = jwt.sign({ id: id, roles: roles }, process.env.JWT_KEY, {
        expiresIn: "48h",
      });
      return res.status(200).json({ token });
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
      const token = jwt.sign({ id: id, roles: roles }, process.env.JWT_KEY, {
        expiresIn: "48h",
      });
      return res.status(200).json({ token });
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
      university.subscribers.push(id);
      await university.save();
      return res.status(200).json({ message: "успех" });
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

      const university = await University.findById(universityId);
      university.comments.push({ text: text, from: id });
      await university.save();
      return res.status(200).json({ message: "успех" });
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
};
