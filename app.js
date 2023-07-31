const express = require("express");

const { PORT = 3001 } = process.env;

const mongoose = require("mongoose");

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {})
  .catch(() => {
    // handle error appropriately instead of console
  });

const routes = require("./routes");

const { NOT_FOUND, INTERNAL_SERVER_ERROR } = require("./utils/errors");

app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: "5d8b8592978f8bd833ca8133",
  };
  next();
});
app.use(routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = NOT_FOUND;
  next(err);
});

// error handler
app.use((err, req, res) => {
  res.status(err.status || INTERNAL_SERVER_ERROR);
  res.json({
    error: {
      message: err.message,
    },
  });
});

app.listen(PORT, () => {});

module.exports = app;
