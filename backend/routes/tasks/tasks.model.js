const { Model, DataTypes } = require("sequelize");
const database = require("../../config/database");
const AuthModel = require("../auth/auth.model");

class TasksModel extends Model {}

TasksModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    authId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("in_progress", "completed"),
      allowNull: false,
      defaultValue: "in_progress",
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
    underscored: true,
    sequelize: database,
  },
);

TasksModel.belongsTo(AuthModel, {
  foreignKey: "authId",
  as: "user",
});

AuthModel.hasMany(TasksModel, {
  foreignKey: "authId",
  as: "tasks",
});

module.exports = TasksModel;
