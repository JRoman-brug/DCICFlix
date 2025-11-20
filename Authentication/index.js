import express from "express";
import debug from "debug";
import { authRouter } from "./routes/auth.route.js";
import { PORT } from "./config.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { connectDatabase } from "./database/database.js";

const log = debug("auth:index");
const app = express();
connectDatabase();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", authRouter);
app.use(errorMiddleware);
app.listen(PORT);
log("auth working");
