const express = require("express");
const cors = require("cors");

const app = express();
require("../db/connect");

const userRoutes = require("../routes/user.routes");
const urlRoutes = require("../routes/url.routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user/", userRoutes);
app.use("/api/url/", urlRoutes);

app.all("*", (req, res) => {
  console.log(req.url);
  console.log(req.method);
  console.log(
    "*****************************************************************"
  );
  res.status(404).send({
    apisStatus: false,
    message: "Invalid URL",
    data: {},
  });
});
module.exports = app;
