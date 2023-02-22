const express = require("express");
const router = express.Router();

const auth = require("../app/middleware/auth.middleware");
const urlController = require("../app/controller/url.Controller");
const reportControllel = require("../monitoring/report");

// // Route to get all URLs for a specific user
router.get("/getAllUrls", auth, urlController.getAllUrls);

// Route to create a new URL
router.post("/createUrl", auth, urlController.createUrl);

router.get("/report", auth, reportControllel.generateReport);

router.get("/report/tag/:tag", auth, reportControllel.generateReportByTag);

// Route to get a specific URL by ID
router.get("/getUrl/:id", auth, urlController.getUrlById);

// Route to update a specific URL by ID
router.put("/updatUrl/:id", auth, urlController.updateUrlById);

// Route to delete a specific URL by ID
router.delete("/deleteUrl/:id", auth, urlController.deleteUrlById);

module.exports = router;
