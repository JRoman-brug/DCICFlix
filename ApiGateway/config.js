export const {
  PORT = 3000,
  SECRET_JWT_KEY,
  AUTH_ENDPOINT = "http://auth:3001",
  USER_MANAGE_ENDPOINT = "http://users:3000",
} = process.env;
