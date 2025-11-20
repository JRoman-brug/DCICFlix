export const {
  PORT = 3000,
  USER_MANAGER_ENDPOINT = "http://users:3000",
  MONGO_URL = "mongodb://mongo:27017/moviesdb",
  SECRET_JWT_KEY,
  SALT_ROUND = 10,
} = process.env;
