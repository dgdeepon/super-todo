const { request, response } = require("express");
const TaskService = require("./tasks.service");
const HTTP_CODES = require("../../constants/responseCodes.jS");
const database = require("../../config/database");
const API_RESPONSE = require("../../helpers/apiResponse.helper");
const { search } = require("./tasks.routes");

class TasksController {
  taskService;
  constructor() {
    this.taskService = new TaskService();
  }
  /**
   * @param {request} req
   * @param {response} res
   */
  createTaskHandler = async (req, res) => {
    const {
      title,
      description,
      priority,
      status,
      date,
      startTime,
      endTime,
      userId,
    } = req.body;

    if (
      !title ||
      !priority ||
      !status ||
      !date ||
      !startTime ||
      !endTime ||
      !userId
    ) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: "Please provide all required fields",
      });
    }

    const transactionId = await database.transaction();
    try {
      await this.taskService.createTask({
        title,
        description,
        priority,
        status,
        date,
        startTime,
        endTime,
        authId: userId,
        transactionId,
      });
      await transactionId.commit();
      return res.status(HTTP_CODES.CREATED).json(
        API_RESPONSE.SUCCESS({
          message: "Task created successfully",
        }),
      );
    } catch (error) {
      await transactionId.rollback();
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: error?.message || "Something went wrong",
        }),
      );
    }
  };

  /**
   * @param {request} req
   * @param {response} res
   */
  editTaskHandler = async (req, res) => {
    const { id, userId } = req.body;
    if (!id || !userId) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: "Please provide all required fields",
      });
    }
    const transactionId = await database.transaction();
    try {
      await this.taskService.editTask({
        authId: userId,
        transactionId,
        ...req.body,
      });
      await transactionId.commit();
      return res.status(HTTP_CODES.OK).json(
        API_RESPONSE.SUCCESS({
          message: "Task updated successfully",
        }),
      );
    } catch (error) {
      await transactionId.rollback();
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: error?.message || "Something went wrong",
        }),
      );
    }
  };

  /**
   * @param {request} req
   * @param {response} res
   */
  deleteTaskHandler = async (req, res) => {
    const { id, userId } = req.body;
    if (!id || !userId) {
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: "Please provide all required fields",
        }),
      );
    }
    const transactionId = await database.transaction();
    try {
      await this.taskService.deleteTask({
        id,
        authId: userId,
        transactionId,
      });
      await transactionId.commit();
      return res.status(HTTP_CODES.OK).json(
        API_RESPONSE.SUCCESS({
          message: "Task deleted successfully",
        }),
      );
    } catch (error) {
      await transactionId.rollback();
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: error?.message || "Something went wrong",
        }),
      );
    }
  };

  /**
   * @param {request} req
   * @param {response} res
   */
  getTasksByDateHandler = async (req, res) => {
    const { date, userId } = req.body;

    if (!date || !userId) {
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: "Please provide all required fields",
        }),
      );
    }
    try {
      const tasks = await this.taskService.getTasksByDate({
        authId: userId,
        date,
      });
      return res.status(HTTP_CODES.OK).json(
        API_RESPONSE.SUCCESS({
          message: "Tasks fetched successfully",
          data: { tasks },
        }),
      );
    } catch (error) {
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: error?.message || "Something went wrong",
        }),
      );
    }
  };

  /**
   * @param {request} req
   * @param {response} res
   */
  getTasksCountSummaryHandler = async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: "Please provide all required fields",
        }),
      );
    }
    try {
      const summary = await this.taskService.getTasksCountSummary({
        authId: userId,
      });
      return res.status(HTTP_CODES.OK).json(
        API_RESPONSE.SUCCESS({
          message: "Task count summary fetched successfully",
          data: { summary },
        }),
      );
    } catch (error) {
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: error?.message || "Something went wrong",
        }),
      );
    }
  };

  /**
   * @param {request} req
   * @param {response} res
   */
  getWeeklyTasksByStatusHandler = async (req, res) => {
    const { userId, status } = req.body;
    if (!userId) {
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: "Please provide all required fields",
        }),
      );
    }
    try {
      const groupedByDate = await this.taskService.getWeeklyTasksByStatus({
        authId: userId,
        status,
      });
      return res.status(HTTP_CODES.OK).json(
        API_RESPONSE.SUCCESS({
          message: "Weekly tasks fetched successfully",
          data: { groupedByDate },
        }),
      );
    } catch (error) {
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: error?.message || "Something went wrong",
        }),
      );
    }
  };

  /**
   * @param {request} req
   * @param {response} res
   */
  searchTasksHandler = async (req, res) => {
    const { userId } = req.body;
    const searchQuery = req.query.q;

    if (!userId) {
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: "Please provide all required fields",
        }),
      );
    }

    if (
      !searchQuery ||
      typeof searchQuery !== "string" ||
      searchQuery.trim() === ""
    ) {
      return res.status(HTTP_CODES.OK).json(
        API_RESPONSE.SUCCESS({
          message: "Tasks fetched successfully",
          data: { tasks: [] },
        }),
      );
    }

    try {
      const tasks = await this.taskService.searchTasks({
        authId: userId,
        searchQuery: searchQuery.trim(),
      });
      return res.status(HTTP_CODES.OK).json(
        API_RESPONSE.SUCCESS({
          message: "Tasks fetched successfully",
          data: { tasks },
        }),
      );
    } catch (error) {
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: error?.message || "Something went wrong",
        }),
      );
    }
  };
}

module.exports = TasksController;
