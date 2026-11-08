const AuthMiddleware = require("./middleware/authMiddleware");
const AuthRouter = require("./routes/auth/auth.routes");
const TasksRouter = require("./routes/tasks/tasks.routes");

const RouteRegister = require("express").Router();

RouteRegister.use("/auth", AuthRouter);
RouteRegister.use("/tasks", AuthMiddleware, TasksRouter);

module.exports = RouteRegister;
