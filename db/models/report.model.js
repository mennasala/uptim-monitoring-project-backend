const mongoose = require("mongoose");
const { Schema } = mongoose;
const Url = require("./url.model");
const reportController = require("../../monitoring/report");
const reportSchema = new Schema({
  urlCheckId: {
    type: Schema.Types.ObjectId,
    ref: "Url",
    required: true,
  },
  tag: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["up", "down"],
    required: true,
  },
  availability: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  outages: {
    type: Number,
    min: 0,
    required: true,
  },
  downtime: {
    type: Number,
    min: 0,
    required: true,
  },
  uptime: {
    type: Number,
    min: 0,
    required: true,
  },
  responseTime: {
    type: Number,
    min: 0,
    required: true,
  },
  history: [
    {
      timestamp: {
        type: Date,
        required: true,
      },
      responseTime: {
        type: Number,
        min: 0,
        required: true,
      },
      status: {
        type: String,
        enum: ["up", "down"],
        required: true,
      },
    },
  ],
});
reportSchema.statics.generateReportByTag = async function (tag, userId) {
  const urls = await Url.findByTagAndUser(tag, userId);
  const report = [];
  for (const url of urls) {
    const urlReport = await reportController.calculateReport(url);
    urlReport.urlName = url.name;
    report.push(urlReport);
  }
  return report;
};

module.exports = mongoose.model("Report", reportSchema);
