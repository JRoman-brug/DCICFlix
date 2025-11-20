export const {
  PORT = 3000,
  SECRET_JWT_KEY,
  MONGO_URL = "mongodb://mongo:27017/moviesdb/",
  AUTH_ENDPOINT = "http://auth:3001/",
  USER_MANAGE_ENDPOINT = "http://users:3000/",
  RANKING_ENDPOINT = "http://calificacion:4000/",
  OPINIONS_ENDPOINT = "http://opiniones:4100/",
  RANDOM_MOVIES_ENDPOINT = "http://random-movies:3004/",
} = process.env;
