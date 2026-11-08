const { request, response, next } = require("express");
const HTTP_CODES = require("../constants/responseCodes.jS");
const API_RESPONSE = require("../helpers/apiResponse.helper");
const PasswordHelper = require("../helpers/password.helper");

/**
 *
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
async function AuthMiddleware(req, res, next) {
  try {
    const token = req.headers?.authorization.split(" ")[1];
    if (!token) {
      return res.status(HTTP_CODES.UNAUTHORIZED).json(
        API_RESPONSE.ERROR({
          message: "You don't have enough permission to perform this action.",
        }),
      );
    }
    
    const tokenData = await PasswordHelper.verifyLoginToken({ token });

    if (!tokenData) {
      return res.status(HTTP_CODES.UNAUTHORIZED).json(
        API_RESPONSE.ERROR({
          message: "You don't have enough permission to perform this action.",
        }),
      );
    }

    req.body = {
      ...req.body,
      userId: tokenData?.userId,
    };

    next();
  } catch (error) {
    console.log(error);
    return res.status(HTTP_CODES.BAD_REQUEST).json(
      API_RESPONSE.ERROR({
        message: error?.message || "authentication failure.",
      }),
    );
  }
}

module.exports = AuthMiddleware;
