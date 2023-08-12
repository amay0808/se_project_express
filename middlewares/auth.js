const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UNAUTHORIZED } = require("../utils/errors");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    console.log("No authorization header found");
    return res.status(UNAUTHORIZED).send({ message: "Authorization required" });
  }

  if (!authorization.startsWith("Bearer ")) {
    console.log("Authorization header does not start with Bearer");
    return res
      .status(UNAUTHORIZED)
      .send({ message: "Authorization format is invalid" });
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    console.log("JWT verification failed:", e.message);
    return res.status(UNAUTHORIZED).send({ message: "Invalid token" });
  }

  req.user = payload;
  return next(); // Changed here
};
