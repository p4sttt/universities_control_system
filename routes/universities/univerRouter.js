const Router = require("express");
const { check, body } = require("express-validator");
const univerController = require("./univeController");

const router = Router();
const controller = new univerController();

router.get("/get", controller.getUniversities);
router.post(
  "/create",
  [
    body("title", "Некорректное название").notEmpty(),
    body("url", "Некорректная ссылка").notEmpty().isURL(),
  ],
  controller.create
);
router.post(
  "/add",
  [
    body("title", "Некорректное название").notEmpty(),
    body("url", "Некорректная ссылка").notEmpty().isURL(),
    body("from").notEmpty().isJWT(),
  ],
  controller.addApplication
);

module.exports = router;
