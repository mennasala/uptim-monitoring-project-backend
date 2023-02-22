const cron = require("node-cron");
const URLCheck = require("../db/models/url.model");
const reportCheck = require("../db/models/report.model");
const axios = require("axios");
const sendEmail = require("./send-email");
const sendWebhookNotification = require("./send-webhook");

cron.schedule("*/10 * * * *", async () => {
  // retrieve all URL checks from the database
  const urlChecks = await URLCheck.find({ createdBy: req.user._id });
  // iterate over each URL check and check its status
  urlChecks.forEach(async (urlCheck) => {
    try {
      // send HTTP request to the URL and measure response time
      const startTime = new Date().getTime();
      const response = await axios.get(urlCheck.url, {
        timeout: urlCheck.timeout,
      });
      const endTime = new Date().getTime();
      const responseTime = endTime - startTime;

      // check if response status code matches assertion criteria (if specified)
      let isUp = true;
      if (urlCheck.assert && urlCheck.assert.statusCode) {
        isUp = response.status === urlCheck.assert.statusCode;
      }

      const reportChecks = await reportCheck.find({ urlCheckId: req.user._id });
      // update URL check in the database
      const statusChanged = urlCheck.status !== isUp;
      reportChecks.status = isUp;
      reportChecks.responseTime = responseTime;
      reportChecks.history.push({ timestamp: new Date(), isUp, responseTime });
      await reportChecks.save();

      // send notification if status changed and user provided email/webhook
      if (statusChanged) {
        // code to send notification
        await sendEmail(
          req.user.email,
          "Notifying about Changing of your URLS status",
          `this URL ${urlCheck.url} status has been changed
status: ${reportChecks.status}
responseTime: ${reportChecks.responseTime}
history of checks: ${reportChecks.history}`
        );
        if (urlCheck.webhook) {
          const webhookUrl = urlCheck.webhook;
          const webhookPayload = {
            // specify the payload data here
            URL: urlCheck.url,
            status: reportChecks.status,
            responseTime: reportChecks.responseTime,
            historyOfChecks: reportChecks.history,
          };
          await sendWebhookNotification(webhookUrl, webhookPayload);
        }
      }
    } catch (error) {
      // handle errors, e.g. request timeout, connection refused, etc.
      console.error(`Error checking URL ${urlCheck.url}: ${error.message}`);
    }
  });
});
