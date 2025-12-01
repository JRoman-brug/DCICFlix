import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3002/",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message;

    if (message === "jwt expired") {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("email_data");

      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);


export default api;
