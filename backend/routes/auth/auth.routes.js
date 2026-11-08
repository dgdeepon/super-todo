const AuthRouter = require("express").Router();
const AuthController = require("./auth.controller");

const authController = new AuthController();

AuthRouter.post("/register", authController.registerUserHandler);
AuthRouter.post("/login", authController.loginUserHandler);

module.exports = AuthRouter;
