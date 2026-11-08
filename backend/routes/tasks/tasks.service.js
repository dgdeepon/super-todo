const { Op } = require("sequelize");
const TasksModel = require("./tasks.model");
const DateHelper = require("../../helpers/date.helper");

class TaskService {
  taskModel;
  constructor() {
    this.taskModel = TasksModel;
  }
  async createTask({
    title,
    description,
    priority,
    status,
    date,
    time,
    authId,
    transactionId,
  }) {
    try {
      await this.taskModel.create(
        {
          title,
          description,
          priority,
          status,
          date,
          time,
          authId,
        },
        {
          transaction: transactionId,
        },
      );
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async editTask({
    id,
    title,
    description,
    priority,
    status,
    date,
    time,
    authId,
    transactionId,
  }) {
    try {
      const body = {
        ...(title ? { title: title } : {}),
        description: description,
        ...(priority ? { priority: priority } : {}),
        ...(status ? { status: status } : {}),
        ...(date ? { date: date } : {}),
        ...(time ? { time: time } : {}),
      };
      await this.taskModel.update(body, {
        where: {
          id,
          authId,
        },
        transaction: transactionId,
      });
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async deleteTask({ id, authId, transactionId }) {
    try {
      await this.taskModel.destroy({
        where: {
          id,
          authId,
        },
        transaction: transactionId,
      });
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async searchTasks({ authId, searchQuery }) {
    try {
      const { firstDayOfWeek, lastDayOfWeek } =
        DateHelper.getThisWeekStartAndEndDate();
      const tasks = await this.taskModel.findAll({
        where: {
          authId,
          date: {
            [Op.between]: [firstDayOfWeek, lastDayOfWeek],
          },
          [Op.or]: [
            {
              title: {
                [Op.like]: `%${searchQuery}%`,
              },
            },
            {
              description: {
                [Op.like]: `%${searchQuery}%`,
              },
            },
          ],
        },
      });

      return tasks;
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async getTasksByDate({ authId, date }) {
    try {
      const { firstDayOfWeek, lastDayOfWeek } =
        DateHelper.getThisWeekStartAndEndDate();

      const selectedDate = new Date(date);
      if (selectedDate < firstDayOfWeek || selectedDate > lastDayOfWeek) {
        throw new Error(
          "Selected date is outside the current week. You can only view tasks within the current week (Monday to Sunday).",
        );
      }

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const tasks = await this.taskModel.findAll({
        where: {
          authId,
          date: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        order: [["time", "ASC"]],
      });

      return tasks;
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async getTasksCountSummary({ authId }) {
    try {
      const { firstDayOfWeek, lastDayOfWeek } =
        DateHelper.getThisWeekStartAndEndDate();

      const weekFilter = {
        authId,
        date: {
          [Op.between]: [firstDayOfWeek, lastDayOfWeek],
        },
      };

      const [completedCount, pendingCount] = await Promise.all([
        this.taskModel.count({
          where: {
            ...weekFilter,
            status: "completed",
          },
        }),
        this.taskModel.count({
          where: {
            ...weekFilter,
            status: "in_progress",
          },
        }),
      ]);

      return {
        completed: completedCount,
        pending: pendingCount,
        total: completedCount + pendingCount,
      };
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async getWeeklyTasksByStatus({ authId, status }) {
    try {
      const { firstDayOfWeek, lastDayOfWeek } =
        DateHelper.getThisWeekStartAndEndDate();

      const whereClause = {
        authId,
        date: {
          [Op.between]: [firstDayOfWeek, lastDayOfWeek],
        },
        ...(status ? { status } : {}),
      };

      const tasks = await this.taskModel.findAll({
        where: whereClause,
        order: [
          ["date", "ASC"],
          ["time", "ASC"],
        ],
      });

      const groupedByDate = tasks.reduce((accumulator, task) => {
        const dateKey = new Date(task.date).toISOString().split("T")[0];
        if (!accumulator[dateKey]) {
          accumulator[dateKey] = [];
        }
        accumulator[dateKey].push(task);
        return accumulator;
      }, {});

      return groupedByDate;
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }
}

module.exports = TaskService;
