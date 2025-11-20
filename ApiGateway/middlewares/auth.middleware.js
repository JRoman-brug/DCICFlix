import jwt from "jsonwebtoken";
import util from "util";
import { SECRET_JWT_KEY } from "../config.js";
import debug from "debug";
import { BadRequestError } from "../errors/erros.js";
import { RevokedToken } from "../models/revoledToken.js";

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
    const authorization = req.headers["authorization"];
    log(`Authorization header raw: ${authorization}`);
    log(`SECRET_JWT_KEY available: ${!!SECRET_JWT_KEY}`);

    if (!authorization) throw new BadRequestError("Token missing");
    if (!/^Bearer\s+/i.test(authorization))
      throw new BadRequestError("Denied access. Bearer token required");
    // Extract token robustly (handle extra spaces): remove 'Bearer' and trim
    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!token) throw new BadRequestError("Denied access. Bearer token required");

    const {
      id: id,
      email: email,
      jti: jti,
      exp: tokenExp,
    } = await verifyAsync(token, SECRET_JWT_KEY);
    log("Token verified");
    await checkBlackList(jti);
    log("Token isnt in blacklist");
    req.headers["x-user-id"] = id;
    req.headers["x-user-email"] = email;
    log("Go to next microservices");
    return next();
  } catch (err) {
    return next(err);
  }
}

async function checkBlackList(jti) {
  log(`Check blacklist: ${jti}`);
  const isRevoked = await RevokedToken.findOne({ jti: jti }).lean();
  log(`Is revoked: ${isRevoked}`);
  if (isRevoked) {
    log(`Token ${jti} encontrado en la lista negra.`);
    throw new BadRequestError("Token revoked");
  }
}
