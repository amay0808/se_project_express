require("dotenv").config();

const express = require("express");

const { PORT = 3001 } = process.env;

const mongoose = require("mongoose");

const app = express();

const cors = require("cors");

app.use(cors());
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => console.log("connected to db"))
  .catch((e) => console.log("DB error", e));
app.use(express.json());
const routes = require("./routes");

app.use(routes);
app.listen(PORT, () => {
  console.log(`App listening at ${PORT}`);
  console.log("This is working");
});

module.exports = app;
