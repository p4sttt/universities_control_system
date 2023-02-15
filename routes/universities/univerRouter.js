const Router = require("express");
const { check, body } = require("express-validator");
const univerController = require("./univeController");

const router = Router();
const controller = new univerController();

router.get("/get", controller.getUniversities);

router.post("/create", controller.create);

module.exports = router;
