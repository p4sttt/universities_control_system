const Router = require("express");
const { body } = require("express-validator");
const applicationController = require("./applicationsController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = Router();
const controller = new applicationController();

router.get("/get", adminMiddleware, controller.get);
router.post(
  "/create",
  [
    body("title").notEmpty(),
    body("url").notEmpty().isURL(),
  ],
  authMiddleware,
  controller.create
);
router.post(
  "/distribute",
  [
    body("applicationId").notEmpty().isMongoId(),
    body("add").notEmpty().isBoolean(),
  ],
  adminMiddleware,
  controller.distribute
);

module.exports = router;
