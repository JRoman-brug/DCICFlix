import express from "express";
import cors from "cors";
import debug from "debug";
import {
  AUTH_ENDPOINT,
  PORT,
  USER_MANAGE_ENDPOINT,
  RANKING_ENDPOINT,
  RANDOM_MOVIES_ENDPOINT,
} from "./config.js";
import proxy from "express-http-proxy";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { connectDatabase } from "./database/database.js";

const app = express();
const log = debug("api-gateway:index");
connectDatabase();
app.use(cors());
app.use(express.json());
app.use("/auth", proxy(AUTH_ENDPOINT));
app.use("/user", [verifyJWT, proxy(USER_MANAGE_ENDPOINT)]);
app.use(
  "/random",
  proxy(RANDOM_MOVIES_ENDPOINT, {
    proxyReqPathResolver: (req) => {
      return `${RANDOM_MOVIES_ENDPOINT}random${req.url}`;
    },
  })
);
app.use(
  "/ratings",
  verifyJWT,
  proxy(RANKING_ENDPOINT, {
    proxyReqPathResolver: (req) => `/api/ratings${req.url}`,
    proxyReqBodyDecorator: async (bodyContent, srcReq) => {
      try {
        const body = bodyContent && Object.keys(bodyContent).length ? bodyContent : {};
        if (!body.userId && srcReq.headers["x-user-id"]) {
          body.userId = srcReq.headers["x-user-id"];
        }
        return JSON.stringify(body);
      } catch (err) {
        return JSON.stringify(bodyContent || {});
      }
    },
  })
);

app.use(errorMiddleware);
app.listen(PORT);

log("Auth endpoint: ", AUTH_ENDPOINT);
log("User-manage endpoint: ", USER_MANAGE_ENDPOINT);
log("ApiGateway working");
