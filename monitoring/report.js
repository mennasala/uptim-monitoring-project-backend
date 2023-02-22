const myHelper = require("../app/helper");
const reportModel = require("../db/models/report.model");
const urlModel = require("../db/models/url.model");
class ReportController {
  static calculateReport = async function (url) {
    try {
      const report = await reportModel.findOne({ urlCheckId: url }).exec();
      if (!report) {
        throw new Error(`No report found for url ${url}`);
      }

      // availability
      const totalChecks = report.history.length;
      const totalUp = report.history.filter(
        (check) => check.status === "up"
      ).length;
      const availability = (totalUp / totalChecks) * 100;

      // response time
      const responseTimes = report.history.map((check) => check.responseTime);
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      // Total uptime/downtime:
      let uptime = 0;
      let downtime = 0;
      let lastStatus = report.history[0].status;
      let lastTimestamp = report.history[0].timestamp;
      report.history.slice(1).forEach((check) => {
        const duration = check.timestamp - lastTimestamp;
        if (lastStatus === "up") {
          uptime += duration;
        } else {
          downtime += duration;
        }
        lastStatus = check.status;
        lastTimestamp = check.timestamp;
      });

      return { availability, avgResponseTime, uptime, downtime };
    } catch (err) {
      console.error(err);
    }
  };

  static generateReport = async (req, res) => {
    try {
      const userId = req.user._id;
      const urls = await urlModel
        .find({ user: userId })
        .sort({ createdAt: "desc" });

      const reportPromises = urls.map((url) => {
        return this.calculateReport(url);
      });

      const reports = await Promise.all(reportPromises);

      myHelper.sendResponse(
        res,
        200,
        true,
        reports,
        "generated report successfully"
      );
    } catch (err) {
      myHelper.sendResponse(res, 500, false, err, "Error generating report");
    }
  };

  static generateReportByTag = async (req, res) => {
    try {
      const tag = req.params.tag;
      const report = await reportModel.generateReportByTag(tag, req.user._id);
      myHelper.sendResponse(
        res,
        200,
        true,
        report,
        "Report generated successfully"
      );
    } catch (err) {
      myHelper.sendResponse(res, 500, false, err, "Error generating report");
    }
  };
}
module.exports = ReportController;
