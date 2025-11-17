import jwt from "jsonwebtoken";
import util from "util";
import { SECRET_JWT_KEY } from "../config.js";
import debug from "debug";
import { BadRequestError } from "../errors/erros.js";

const log = debug("api-gateway:auth-middleware");

// 1. Crea una versión de 'verify' que devuelve una Promesa
const verifyAsync = util.promisify(jwt.verify);

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function verifyJWT(req, res, next) {
  try {
    log("Verify a token");
    const { token } = req.body;
    if (!token) throw new BadRequestError("Token missing");
    const { payload } = await verifyAsync(token, SECRET_JWT_KEY);
    req.user = payload;
    return next();
  } catch (err) {
    next(err);
  }
}
