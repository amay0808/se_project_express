const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UNAUTHORIZED } = require("../utils/errors");

module.exports = (req, res, next) => {
  console.log("Auth middleware is running");

  const { authorization } = req.headers;
  console.log("Authorization Header:", authorization);
  if (!authorization) {
    // console.log("No authorization header found");
    return res.status(UNAUTHORIZED).send({ message: "Authorization required" });
  }

  if (!authorization.startsWith("Bearer ")) {
    // console.log("Authorization header does not start with Bearer");
    return res
      .status(UNAUTHORIZED)
      .send({ message: "Authorization format is invalid" });
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    console.log("Token received:", token);
    console.log("JWT_SECRET used:", JWT_SECRET);
    payload = jwt.verify(token, JWT_SECRET);
    console.log("Payload after JWT verification:", payload);
  } catch (e) {
    console.log("JWT verification failed:", e.message);
    return res.status(UNAUTHORIZED).send({ message: "Invalid token" });
  }

  req.user = payload;
  console.log("User set in Request:", req.user);
  return next();
};
