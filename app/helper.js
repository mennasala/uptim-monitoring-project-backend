class MyHelper {
  static sendResponse(res, statusCode, requestStatus, data, messag) {
    res.status(statusCode).send({
      requestStatus,
      data,
      message: messag,
    });
  }
}

module.exports = MyHelper;
