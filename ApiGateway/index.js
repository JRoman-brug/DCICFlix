import express from "express";
import cors from "cors";
import debug from "debug";
import {
  AUTH_ENDPOINT,
  PORT,
  USER_MANAGE_ENDPOINT,
  RANKING_ENDPOINT,
  OPINIONS_ENDPOINT,
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
  "/ratings",
  verifyJWT,
  proxy(RANKING_ENDPOINT, {
    proxyReqPathResolver: (req) => `/api/ratings${req.url}`
  })
);
app.use(
  "/opinions/movie",
  proxy(OPINIONS_ENDPOINT, {
    proxyReqPathResolver: (req) => `/api/opinions/movie${req.url}`,
  })
);

app.use(
  "/opinions/user",
  verifyJWT,
  proxy(OPINIONS_ENDPOINT, {
    proxyReqPathResolver: (req) => {
      const userId = req.headers["x-user-id"];
      if ((req.url === "/" || req.url === "") && userId) {
        return `/api/opinions/user/${userId}`;
      }
      return `/api/opinions/user${req.url}`;
    },
  })
);
app.use(errorMiddleware);
app.listen(PORT);

log("Auth endpoint: ", AUTH_ENDPOINT);
log("User-manage endpoint: ", USER_MANAGE_ENDPOINT);
log("ApiGateway working");
