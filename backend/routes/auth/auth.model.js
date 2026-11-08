const { Model, DataTypes } = require("sequelize");
const database = require("../../config/database");

class AuthModel extends Model {}

AuthModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
  {
    tableName: "auth",
    underscored: true,
    timestamps: true,
    sequelize: database,
  },
);

module.exports = AuthModel;
