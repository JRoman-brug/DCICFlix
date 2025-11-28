import express from "express";
import cors from "cors";
import debug from "debug";
import {
  AUTH_ENDPOINT,
  PORT,
  USER_MANAGE_ENDPOINT,
  RANKING_ENDPOINT,
  OPINIONS_PROXY_ENDPOINT,
  RANDOM_MOVIES_ENDPOINT,
  MOVIES_ENDPOINT
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
  "/movies",
  proxy(MOVIES_ENDPOINT, {
    proxyReqPathResolver: (req) => `/movies${req.url}`,
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
        if (srcReq.headers["x-user-id"]) {
          body.userId = srcReq.headers["x-user-id"];
        }
        if (srcReq.headers["x-user-email"]) {
          body.userMail = srcReq.headers["x-user-email"];
        }
        return JSON.stringify(body);
      } catch (err) {
        return JSON.stringify(bodyContent || {});
      }
    },
  })
);

app.use(
  "/opinions",
  proxy(OPINIONS_PROXY_ENDPOINT, {
    proxyReqPathResolver: (req) => `/api/opinions${req.url}`,
  })
);

app.use(errorMiddleware);
app.listen(PORT);

log("Auth endpoint: ", AUTH_ENDPOINT);
log("User-manage endpoint: ", USER_MANAGE_ENDPOINT);
log("Opinions proxy endpoint: ", OPINIONS_PROXY_ENDPOINT);
log("ApiGateway working");
