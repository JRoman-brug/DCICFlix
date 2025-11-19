import express from "express";
import cors from "cors";
import debug from "debug";
import { AUTH_ENDPOINT, PORT, USER_MANAGE_ENDPOINT } from "./config.js";
import proxy from "express-http-proxy";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();
const log = debug("api-gateway:index");

app.use(cors());
app.use(express.json());
app.use("/auth", proxy(AUTH_ENDPOINT));
app.use("/user", [verifyJWT, proxy(USER_MANAGE_ENDPOINT)]);
app.use(errorMiddleware);
app.listen(PORT);

log("Auth endpoint: ", AUTH_ENDPOINT);
log("User-manage endpoint: ", USER_MANAGE_ENDPOINT);
log("ApiGateway working");
