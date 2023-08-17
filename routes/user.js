const router = require("express").Router();
const userController = require("../controllers/userControllers");
const {catchErrors} = require("../handlers/errorHandlers");


router.post("/login", catchErrors(userController.login));
router.post("/register",catchErrors(userController.register));
router.get("/logout",userController.logout);


module.exports = router;
