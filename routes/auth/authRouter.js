const Router = require("express");
const { body } = require("express-validator");
const authController = require("./authController");
const authMiddleware = require("../middlewares/authMiddleware");

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
router.post("/admin", controller.addAdminPermission);
router.post(
  "/notifications",
  [body("set").notEmpty().isBoolean()],
  authMiddleware,
  controller.setNotifications
);
router.post(
  "/subscribe",
  [body("universityId").notEmpty().isMongoId()],
  authMiddleware,
  controller.subscribe
);
router.post(
  "/comment",
  [
    body("text").notEmpty().isLength({ max: 32 }),
    body("universityId").notEmpty().isMongoId(),
  ],
  authMiddleware,
  controller.comment
);

module.exports = router;
