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
  "/unsubscribe",
  [body("universityId").notEmpty().isMongoId()],
  authMiddleware,
  controller.unsubscribe
);
router.get("/getSubscribes", authMiddleware, controller.getSubscribes);
router.post(
  "/comment",
  [
    body("text").notEmpty().isLength({ max: 32 }),
    body("universityId").notEmpty().isMongoId(),
  ],
  authMiddleware,
  controller.comment
);
router.post(
  "/getComment",
  [
    body("universityId").notEmpty().isMongoId(),
  ],
  authMiddleware,
  controller.getComments
);
router.post(
  "/rating",
  [
    body("rating")
      .notEmpty()
      .isNumeric()
      .isLength((min = 1), (max = 5)),
    body("universityId").notEmpty().isMongoId(),
  ],
  authMiddleware,
  controller.rarting
);

module.exports = router;
