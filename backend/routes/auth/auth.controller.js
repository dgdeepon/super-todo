const { request, response } = require("express");
const HTTP_CODES = require("../../constants/responseCodes.jS");
const API_RESPONSE = require("../../helpers/apiResponse.helper");
const database = require("../../config/database");
const AuthService = require("./auth.service");

class AuthController {
  authService;
  constructor(){
    this.authService = new AuthService();
  }
  /**
   * @param {request} req
   * @param {response} res
   */
  registerUserHandler = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: "Please provide all required fields",
        }),
      );
    }

    const transactionId = await database.transaction();
    try {
      await this.authService.registerUser({
        firstName,
        lastName,
        email,
        password,
        transactionId,
      });
      await transactionId.commit();
      const loginResponse = await this.authService.loginUser({
        email,
        password,
      });
      return res.status(HTTP_CODES.CREATED).json(
        API_RESPONSE.SUCCESS({
          message: "User registered successfully",
          data: loginResponse,
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
  loginUserHandler = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(HTTP_CODES.BAD_REQUEST).json(
        API_RESPONSE.ERROR({
          message: "Please provide all required fields",
        }),
      );
    }
    try {
      const loginResponse = await this.authService.loginUser({
        email,
        password,
      });
      return res.status(HTTP_CODES.OK).json(
        API_RESPONSE.SUCCESS({
          message: "User logged in successfully",
          data: loginResponse,
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

module.exports = AuthController;
