const TasksRouter = require("express").Router();
const TasksController = require("./tasks.controller");

const tasksController = new TasksController();

TasksRouter.post("/", tasksController.createTaskHandler);
TasksRouter.put("/", tasksController.editTaskHandler);
TasksRouter.delete("/", tasksController.deleteTaskHandler);
TasksRouter.post("/by-date", tasksController.getTasksByDateHandler);
TasksRouter.get("/search", tasksController.searchTasksHandler);
TasksRouter.get("/count-summary", tasksController.getTasksCountSummaryHandler);
TasksRouter.post("/weekly", tasksController.getWeeklyTasksByStatusHandler);

module.exports = TasksRouter;
