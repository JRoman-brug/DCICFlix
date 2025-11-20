import debug from "debug";
import jwt from "jsonwebtoken";
const log = debug("auth:ErrorMiddleware ");
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function errorMiddleware(err, req, res, next) {
  if (err.isOperational) {
    log(err.message);
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  }
  if (err instanceof jwt.TokenExpiredError) {
    return res.status(400).json({
      message: "Token expired",
    });
  }
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(400).json({
      message: "Token not valid",
    });
  }
  if (err instanceof jwt.NotBeforeError) {
    return res.status(400).json({
      message: "Not before use",
    });
  }
  log(err);
  return res.status(500).send("Internal server error");
}
