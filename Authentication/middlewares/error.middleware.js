import debug from "debug";
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
  log(err);
  return res.status(500).send("Internal server error");
}
