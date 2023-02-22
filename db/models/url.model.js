const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  protocol: {
    type: String,
    enum: ["HTTP", "HTTPS", "TCP"],
    default: "HTTP",
    required: true,
  },
  path: {
    type: String,
  },
  port: {
    type: Number,
  },
  webhook: {
    type: String,
  },
  timeout: {
    type: Number,
    default: 5,
  },
  interval: {
    type: Number,
    default: 10,
  },
  threshold: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
  },
  authentication: {
    username: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  httpHeaders: {
    type: Map,
    of: String,
  },
  assert: {
    statusCode: {
      type: Number,
    },
  },
  tags: [{ type: String }],
  ignoreSSL: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
urlSchema.statics.findByTagAndUser = async function (tag, userID) {
  return this.find({ tags: tag, user: userID });
};

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;
