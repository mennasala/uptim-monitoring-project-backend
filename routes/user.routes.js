const router = require("express").Router();
const auth = require("../app/middleware/auth.middleware");
const User = require("../app/controller/user.controller");

router.post("/register", User.register);
router.post("/login", User.login);
//logout from this device only
router.post("/logout", auth, User.logOut);

module.exports = router;
