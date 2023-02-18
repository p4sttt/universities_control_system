const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.headers.token;

    if (!token) {
      res.status(403).json({ message: "Пользователь не авторизован" });
    }
    jwt.verify(token, process.env.JWT_KEY);
    next();
  } catch (error) {
    res.status(403).json({ message: "Пользователь не авторизован" });
  }
};
