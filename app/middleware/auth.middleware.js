const jwt = require("jsonwebtoken");
const userModel = require("../../db/models/user.model");
const myHelper = require("../helper");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.tokenPass);
    const userData = await userModel.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!userData) throw new Error("Invalid  token");
    req.user = userData;
    req.token = token;
    next();
  } catch (err) {
    myHelper.sendResponse(res, 500, false, err, err.message);
  }
};
module.exports = auth;
