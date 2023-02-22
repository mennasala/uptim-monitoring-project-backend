const userModel = require("../../db/models/user.model");
const myHelper = require("../helper");
const sendEmail = require("../../monitoring/send-email");

class User {
  static register = async (req, res) => {
    try {
      const newUser = new userModel(req.body);
      await newUser.save();
      const link = `${process.env.BASE_URL}/verification code/${newUser._id}/`;
      await sendEmail(newUser.email, "Register verification link", link);
      myHelper.sendResponse(res, 200, true, newUser, "registered successfully");
    } catch (err) {
      myHelper.sendResponse(res, 500, false, err, err.message);
    }
  };

  static login = async (req, res) => {
    try {
      const userData = await userModel.loginUser(
        req.body.email,
        req.body.password
      );
      const token = await userData.generateToken();
      myHelper.sendResponse(
        res,
        200,
        true,
        { user: userData, token },
        "successfully logged in"
      );
    } catch (err) {
      myHelper.sendResponse(res, 500, false, err, err.message);
    }
  };

  static logOut = async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter((t) => t.token != req.token);
      await req.user.save();
      myHelper.sendResponse(res, 200, true, null, "logged out");
    } catch (e) {
      myHelper.sendResponse(res, 500, false, e, e.message);
    }
  };
}
module.exports = User;
