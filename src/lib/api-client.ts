import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Client Error]", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);
