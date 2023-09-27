// error-handler.js
module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error details for debugging
  console.error("Error Details:", err);

  res.status(statusCode).send({ message });
};
