class AppError extends Error {
  statusCode;
  statusCode;
  isOperational;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class SessionExpireError extends AppError {
  constructor(message) {
    super(message || "Sesion expire", 400);
  }
}

export class BadRequestError extends AppError {
  constructor(message) {
    super(message || "Request not valid", 400);
  }
}
