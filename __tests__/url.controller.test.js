const urlController = require("../app/controller/url.controller");
const Url = require("../db/models/url.model");
const myHelper = require("../app/helper");
const mongoose = require("mongoose");

describe("test all method in url controller", () => {
  describe("getAllUrls", () => {
    it("should return all URLs for the authenticated user", async () => {
      // Mock the request and response objects
      const req = { user: { _id: "123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock the URL.find method to return some URLs
      Url.find = jest.fn().mockResolvedValue([
        { _id: "abc", name: "Google", url: "https://www.google.com" },
        { _id: "def", name: "Facebook", url: "https://www.facebook.com" },
      ]);

      // Call the getAllUrls method
      await urlController.getAllUrls(req, res);

      // Check that the URL.find method was called with the correct arguments
      expect(Url.find).toHaveBeenCalledWith({ user: "123" });
      expect(Url.find).toHaveBeenCalledWith({ user: expect.any(String) });
      expect(Url.find).toHaveBeenCalledTimes(1);

      // Check that the response status and JSON were called with the correct arguments
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ urls: expect.any(Array) });
      expect(res.json.mock.calls[0][0].urls).toHaveLength(2);
    });

    it("should return a server error if there is a problem with the database", async () => {
      // Mock the request and response objects
      const req = { user: { _id: "123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock the URL.find method to throw an error
      Url.find = jest.fn().mockRejectedValue(new Error("Database error"));

      // Call the getAllUrls method
      await urlController.getAllUrls(req, res);

      // Check that the URL.find method was called with the correct arguments
      expect(Url.find).toHaveBeenCalledWith({ user: "123" });
      expect(Url.find).toHaveBeenCalledTimes(1);

      // Check that the response status and JSON were called with the correct arguments
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
  });

  describe("createUrl", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        body: {
          name: "Example",
          url: "https://example.com",
          protocol: "HTTPS",
        },
        user: {
          _id: "user123",
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      next = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should create a new URL object and save it to the database", async () => {
      // Mock Url model's save method to return a new Url object
      const mockUrl = new Url({
        _id: "url123",
        name: "Example",
        url: "https://example.com",
        protocol: "HTTPS",
        createdBy: "user123",
      });
      jest.spyOn(Url.prototype, "save").mockResolvedValueOnce(mockUrl);

      await urlController.createUrl(req, res, next);

      expect(Url.prototype.save).toHaveBeenCalledTimes(1);
      expect(Url.prototype.save).toHaveBeenCalledWith();

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({
        requestStatus: true,
        data: mockUrl,
        message: "URL check created successfully",
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should send an error response if required input data is missing", async () => {
      req.body = {};

      await urlController.createUrl(req, res, next);

      expect(Url.prototype.save).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({
        requestStatus: false,
        data: {},
        message: "Missing required input data",
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should send an error response if there is an error while saving the Url object to the database", async () => {
      // Mock Url model's save method to throw an error
      const mockError = new Error("Error saving Url");
      jest.spyOn(Url.prototype, "save").mockRejectedValueOnce(mockError);

      await urlController.createUrl(req, res, next);

      expect(Url.prototype.save).toHaveBeenCalledTimes(1);
      expect(Url.prototype.save).toHaveBeenCalledWith();

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({
        requestStatus: false,
        data: mockError,
        message: "Error saving Url",
      });

      expect(next).not.toHaveBeenCalled();
    });
  });
});
