const Router = require("express");
const { body } = require("express-validator");
const univerController = require("./univeController");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = Router();
const controller = new univerController();

router.get("/get", controller.getUniversities);
router.post(
  "/create",
  [
    body("title", "Некорректное название").notEmpty(),
    body("url", "Некорректная ссылка").notEmpty().isURL(),
  ],
  // adminMiddleware,
  controller.create
);

module.exports = router;
