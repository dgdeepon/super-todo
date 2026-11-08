require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routeRegister = require("./register");
const database = require("./config/database");
const HTTP_CODES = require("./constants/responseCodes.jS");
const API_RESPONSE = require("./helpers/apiResponse.helper");

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (origin && !origin.includes(process.env.ALLOWED_ORIGIN)) {
        return callback(new Error("Request not allowed"));
      }
      return callback(null, true);
    },
  }),
);
app.use(express.json());

app.use("/api", routeRegister);

app.use((error, req, res, next) => {
  if (error) {
    console.error(`Global error: ${error}`);
    return res.status(HTTP_CODES.BAD_REQUEST).json(
      API_RESPONSE.ERROR({
        message: error,
      }),
    );
  }
});

const APP_PORT = process.env.PORT;
app.listen(APP_PORT, async () => {
  try {
    await database.authenticate();
    console.log(`Server is running on port ${APP_PORT}`);
  } catch (error) {
    console.error(error);
  }
});
