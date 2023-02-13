const Router = require("express");
const { check, body } = require("express-validator");
const authController = require("./authController");

const router = Router();
const controller = new authController();

router.post(
  "/create",
  [
    body("email", "Некорректная почта").notEmpty().isEmail(),
    body("name", "Имя должно быть длинее 3 символов")
      .notEmpty()
      .isLength({ min: 3 }),
    body("password", "Пароль должен быть длинее 5 символов")
      .notEmpty()
      .isLength({ min: 5 }),
  ],
  controller.register
);

router.post(
  "/login",
  [
    body("email", "Некорректная почта").notEmpty().isEmail(),
    body("password", "Пароль должен быть длинее 5 символов")
      .notEmpty()
      .isLength({ min: 5 }),
  ],
  controller.login
);

router.get("/create/role", controller.createRole);

module.exports = router