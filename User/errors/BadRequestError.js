import AppError from "./AppError.js";

export default class BadRequestError extends AppError {
  constructor(message) {
    super(message || "Request not valid", 400);
  }
}
