export const {
  PORT = 3000,
  SECRET_JWT_KEY,
  AUTH_ENDPOINT = "http://auth:3001",
  USER_MANAGE_ENDPOINT = "http://users:3000",
  RANKING_ENDPOINT = "http://calificacion:4000",
  OPINIONS_ENDPOINT = "http://opiniones:4100",
} = process.env;
