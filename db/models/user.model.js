const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userScema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
      vaidate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("invalid Email");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      required: true,
      //match: "",
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
userScema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcryptjs.hash(this.password, 8);
  }
});
userScema.statics.loginUser = async (email, password) => {
  const userData = await User.findOne({ email });
  const validatePassword = await bcryptjs.compare(password, userData.password);
  if (!userData) throw new Error("invalid Email");
  if (!validatePassword) throw new Error("invalid password");
  return userData;
};
userScema.methods.generateToken = async function () {
  const userData = this;
  const token = jwt.sign({ _id: userData._id }, process.env.tokenPass);
  userData.tokens = userData.tokens.concat({ token });
  await userData.save();
  return token;
};
userScema.methods.toJSON = function () {
  const data = this.toObject();
  delete data.__v;
  delete data.password;
  delete data.tokens;
  return data;
};
const User = mongoose.model("User", userScema);

module.exports = User;
