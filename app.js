const express = require("express");

const { PORT = 3001 } = process.env;

const mongoose = require("mongoose");

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => console.log("connected to db"))
  .catch((e) => console.log("DB error", e));

const routes = require("./routes");

app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: "5d8b8592978f8bd833ca8133",
  };
  next();
});
app.use(routes);
app.listen(PORT, () => {
  console.log(`App listening at ${PORT}`);
  console.log("This is working");
});

module.exports = app;
