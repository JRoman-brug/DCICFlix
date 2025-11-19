import express from "express";
import { mongoose } from "mongoose";
import dotenv from "dotenv";
import { userRouter } from "./routes/user.route.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
export const SALT = 10;
//Middleware to parse JSON bodies
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || "mongodb://mongo:27017/moviesdb";
console.log("Connecting to MongoDB at:", MONGO_URL);
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.use("/user", userRouter);

app.use((err, req, res, next) => {
  if (err.isOperational) {
    console.log(err.message);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  console.log(err);
  return res.status(500).send("Internal server error");
});
app.listen(port);
