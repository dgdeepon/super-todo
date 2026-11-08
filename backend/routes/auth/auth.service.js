const PasswordHelper = require("../../helpers/password.helper");
const AuthModel = require("./auth.model");

class AuthService {
  authModel;
  constructor() {
    this.authModel = AuthModel;
  }

  async registerUser({ firstName, lastName, email, password, transactionId }) {
    try {
      const isUserExists = await this.findUserByEmail({
        email,
      });

      if (isUserExists) {
        throw new Error(
          "Looks like you're already registered! Please log in using your existing account.",
        );
      }

      const hashedPassword = await PasswordHelper.hashPassword({ password });
      await this.authModel.create(
        {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
        {
          transaction: transactionId,
        },
      );
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }

  async findUserByEmail({ email }) {
    try {
      const user = await this.authModel.findOne({
        where: {
          email,
        },
      });

      return user;
    } catch (error) {
      throw new Error("Failed to validate the email.");
    }
  }

  async loginUser({ email, password }) {
    try {
      const findUser = await this.authModel.findOne({
        where: {
          email,
        },
      });
      if (!findUser) {
        throw new Error(
          "Invalid email provided. Please check your email and try again.",
        );
      }
      const isPasswordValid = await PasswordHelper.comparePassword({
        password,
        salted: findUser.password,
      });
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }
      const token = await PasswordHelper.generateLoginToken({
        userId: findUser.id,
        name: `${findUser.firstName} ${findUser.lastName}`,
        email: findUser.email,
      });
      return {
        token,
        user: {
          name: `${findUser.firstName} ${findUser.lastName}`,
          email: findUser.email,
        },
      };
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }
}

module.exports = AuthService;
