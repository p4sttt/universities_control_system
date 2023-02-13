const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Role = require("../../models/Role");
const User = require("../../models/User");

module.exports = class authController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "ошибка валидации" });
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
      const { id } = user._id;
      const token = jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: "48h" });
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
      const { id } = user._id;
      const token = jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: "48h" });
      return res.status(200).json({ token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }

  async createRole(req, res) {
    try {
      const userRole = new Role();
      const adminRole = new Role({ value: "ADMIN" });
      await userRole.save();
      await adminRole.save();
      res.status(200).json();
    } catch (error) {
      res.status(500).json({ message: "Что-то пошло не так :(" });
    }
  }
};
