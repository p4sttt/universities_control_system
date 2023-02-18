const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.headers.token;

    if (!token) {
      res.status(403).json({ message: "Пользователь не авторизован" });
    }
    const { roles } = jwt.verify(token, process.env.JWT_KEY);
    if (!roles.includes("ADMIN")) {
      res
        .status(403)
        .json({ message: "Пользователь не имеет прав администратора" });
    } else {
      next();
    }
  } catch (error) {
    res.status(403).json({ message: "Пользователь не авторизован" });
  }
};
