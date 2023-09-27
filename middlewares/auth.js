const jwt = require("jsonwebtoken"); // Moved up
const UnauthorizedError = require("../errors/UnauthorizedError"); // Moved down
const { JWT_SECRET } = require("../utils/config");

module.exports = (req, res, next) => {
  console.log("Auth middleware is running");

  const { authorization } = req.headers;
  console.log("Authorization Header:", authorization);

  if (!authorization) {
    throw new UnauthorizedError("Authorization required");
  }

  if (!authorization.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authorization format is invalid");
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
    throw new UnauthorizedError("Invalid token");
  }

  req.user = payload;
  console.log("User set in Request:", req.user);
  return next();
};
