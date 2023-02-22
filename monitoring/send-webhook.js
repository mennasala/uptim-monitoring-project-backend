const axios = require("axios");

const sendWebhookNotification = async (url, payload) => {
  try {
    const response = await axios.post(url, payload);
    console.log(
      `Webhook notification sent. Response status: ${response.status}`
    );
  } catch (error) {
    console.error("Error sending webhook notification:", error);
  }
};

module.exports = sendWebhookNotification;
