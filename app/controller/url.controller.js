const myHelper = require("../helper");
const Url = require("../../db/models/url.model");

class User {
  static getAllUrls = async (req, res) => {
    try {
      const userId = req.user._id;
      const urls = await Url.find({
        user: userId,
      });
      res.status(200).json({ urls });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server error" });
    }
  };

  static createUrl = async (req, res, next) => {
    try {
      const {
        name,
        url,
        protocol,
        path,
        port,
        webhook,
        timeout,
        interval,
        threshold,
        authentication,
        httpHeaders,
        assert,
        tags,
        ignoreSSL,
      } = req.body;

      // Validate input data
      if (!name || !url || !protocol) {
        return myHelper.sendResponse(
          res,
          500,
          false,
          {},
          "Missing required input data"
        );
      }
      //console.log(req.user);
      // Create new URL object
      const newUrl = new Url({
        name,
        url,
        protocol,
        path,
        port,
        webhook,
        timeout,
        interval,
        threshold,
        authentication,
        httpHeaders,
        assert,
        tags,
        ignoreSSL,
        createdBy: req.user._id, // Set createdBy field to the current user's ID
      });

      // Save new URL object to database
      const savedUrl = await newUrl.save();

      // Return success response
      myHelper.sendResponse(
        res,
        201,
        true,
        savedUrl,
        "URL check created successfully"
      );
    } catch (err) {
      myHelper.sendResponse(res, 500, false, err, err.message);
    }
  };

  // Get URL by ID
  static getUrlById = (req, res) => {
    try {
      const { id } = req.params;

      // Validate URL ID
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return myHelper.sendResponse(
          res,
          400,
          false,
          "",
          "Invalid URL ID format"
        );
      }

      // Find URL by ID
      Url.findById(id)
        .populate("createdBy", req.user._id)
        .exec((err, url) => {
          if (err) {
            return myHelper.sendResponse(
              res,
              500,
              false,
              err,
              "Error finding URL"
            );
          }
          if (!url) {
            return myHelper.sendResponse(res, 404, false, "", "URL not found");
          }
          return myHelper.sendResponse(
            res,
            200,
            true,
            url,
            "found URL successfully"
          );
        });
    } catch (err) {
      myHelper.sendResponse(res, 500, false, err, err.message);
    }
  };

  // Update a URL by ID
  static updateUrlById = (req, res) => {
    const { id } = req.params;

    // Validate input data
    const {
      name,
      url,
      protocol,
      path,
      port,
      webhook,
      timeout,
      interval,
      threshold,
      authentication,
      httpHeaders,
      assert,
      tags,
      ignoreSSL,
    } = req.body;

    if (!name || !url || !protocol) {
      return myHelper.sendResponse(
        res,
        400,
        false,
        "",
        "Name, url and protocol are required"
      );
    }

    // Build update object
    const updateObj = {};
    if (name) updateObj.name = name;
    if (url) updateObj.url = url;
    if (protocol) updateObj.protocol = protocol;
    if (path) updateObj.path = path;
    if (port) updateObj.port = port;
    if (webhook) updateObj.webhook = webhook;
    if (timeout) updateObj.timeout = timeout;
    if (interval) updateObj.interval = interval;
    if (threshold) updateObj.threshold = threshold;
    if (authentication) updateObj.authentication = authentication;
    if (httpHeaders) updateObj.httpHeaders = httpHeaders;
    if (assert) updateObj.assert = assert;
    if (tags) updateObj.tags = tags;
    if (ignoreSSL) updateObj.ignoreSSL = ignoreSSL;

    // Find and update URL by ID
    Url.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true },
      (err, url) => {
        if (err) {
          return myHelper.sendResponse(
            res,
            500,
            false,
            "",
            "Error updating URL"
          );
        }
        if (!url) {
          return myHelper.sendResponse(res, 404, false, "", "URL not found");
        }
        return myHelper.sendResponse(
          res,
          200,
          true,
          url,
          "URL updated successfully"
        );
      }
    );
  };

  static deleteUrlById = async (req, res) => {
    const { id } = req.params;

    try {
      const url = await Url.findById(id);
      if (!url) {
        return myHelper.sendResponse(res, 404, false, "", "URL not found");
      }
      await url.remove();
      return myHelper.sendResponse(
        res,
        200,
        true,
        "",
        "URL deleted successfully"
      );
    } catch (err) {
      return myHelper.sendResponse(res, 500, false, err, "Error deleting URL");
    }
  };
}
module.exports = User;
