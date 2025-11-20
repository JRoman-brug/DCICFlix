import axios from "axios";
import debug from "debug";
import bcrypt from "bcrypt";
import { loginUserSchema, registerUserSchema } from "../schemas/user.schema.js";
import { USER_MANAGER_ENDPOINT } from "../config.js";
import { BadRequestError, NotFoundError } from "../errors/Errors.js";
import { dataParse, revokeToken } from "../utils/utils.js";
import { sign, verify } from "../jwt/jwt.service.js";
const log = debug("auth:auth-controller");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function login(req, res, next) {
  try {
    log("New request in login");
    const bodyParse = dataParse(req.body, loginUserSchema.safeParse);

    const { email, password } = bodyParse;
    const request = `${USER_MANAGER_ENDPOINT}/user/by-email/${email}`;
    const { data } = await axios.get(request).catch((err) => {
      throw new NotFoundError("User not found");
    });
    const isPasswordCorrect = await bcrypt.compare(password, data.password);
    if (!isPasswordCorrect) throw new BadRequestError("Incorrect password");

    const payload = {
      id: data.id,
      email: data.email,
    };
    const token = await sign(payload, "10h");

    return res
      .status(200)
      .json({
        id: data.id,
        email: data.email,
        token: token,
        message: "login sucessfully",
      })
      .send();
  } catch (err) {
    next(err);
  }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function register(req, res, next) {
  try {
    log("New request in register");
    const bodyParse = dataParse(req.body, registerUserSchema.safeParse);

    const { email, password } = bodyParse;
    const request = `${USER_MANAGER_ENDPOINT}/user/`;
    const bodyRequest = {
      email: email,
      password: password,
    };
    const { data } = await axios.post(request, bodyRequest).catch((err) => {
      throw new BadRequestError(err.response.data.message);
    });
    const { id: userId, email: userEmail } = data;
    const payload = { id: userId, email: userEmail };
    log(payload);
    const token = await sign(payload, "10h");

    return res
      .status(201)
      .json({
        id: userId,
        email: userEmail,
        token: token,
        message: "login sucessfully",
      })
      .send();
  } catch (err) {
    return next(err);
  }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function refreshToken(req, res, next) {
  try {
    log("New request in refresh");
    const token = verifyBearerToken(req.headers);
    const { id: userId, email: userEmail } = await verify(token);
    const payload = {
      id: userId,
      email: userEmail,
    };
    const newToken = await sign(payload, "2 days");
    return res.status(200).json({ accessToke: newToken });
  } catch (err) {
    next(err);
  }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').next} next
 */
export async function logout(req, res, next) {
  try {
    const token = verifyBearerToken(req.headers);

    const { jti: jti, exp: tokenExp } = await verify(token);

    await revokeToken(jti, tokenExp);
    return res
      .status(201)
      .json({
        message: "Logout successfully",
      })
      .send();
  } catch (err) {
    log(err);
    next(err);
  }
}

function verifyBearerToken(headers) {
  const authorization = headers["authorization"];

  if (!authorization) throw new BadRequestError("Token missing");
  if (!authorization.startsWith("Bearer "))
    throw new BadRequestError("Denied access. Bearer token required");
  return authorization.split(" ")[1];
}
