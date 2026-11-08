require("dotenv").config();
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

class PasswordHelper {
  static validatePassword({ password }) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    return passwordRegex.test(password);
  }
  static async hashPassword({ password }) {
    try {
      const isValidPassword = this.validatePassword({ password });
      if (!isValidPassword) {
        console.error({
          message:
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one special character.",
        });
        throw new Error(
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one special character.",
        );
      }

      const hashedPassword = await bcrypt.hash(
        password,
        Number(process.env.PASSWORD_SALT_ROUNDS),
      );

      return hashedPassword;
    } catch (error) {
      throw new Error(error?.message || "Something went wrong");
    }
  }
  static async comparePassword({ password, salted }) {
    try {
      const isValidPassword = this.validatePassword({ password });
      if (!isValidPassword) {
        throw new Error("Invalid password provided.");
      }

      const isValid = await bcrypt.compare(password, salted);

      return isValid;
    } catch (error) {
      throw new Error("Failed to validate your password.");
    }
  }
  static async generateLoginToken({ userId, name, email }) {
    try {
      const token = jsonwebtoken.sign(
        {
          userId,
          name,
          email,
          loggedInAt: new Date().getTime(),
        },
        process.env.JSON_PRIVATE_KEY,
      );

      return token;
    } catch (error) {
      throw new Error(error?.message || "Failed to generate login token.");
    }
  }
  static async verifyLoginToken({ token }) {
    try {
      const decodedValue = jsonwebtoken.verify(
        token,
        process.env.JSON_PRIVATE_KEY,
        (error, decoded) => {
          if (error) {
            throw error;
          }

          return decoded;
        },
      );

      return decodedValue;
    } catch (error) {
      throw new Error(
        error?.message || "Your session may have expired. Please log in again.",
      );
    }
  }
}

module.exports = PasswordHelper;
