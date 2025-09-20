import axios from "axios";

const BASE_URL =process.env.NEXT_PUBLIC_SERVER_URL || "http://192.168.1.11:3009/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("custom-auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default apiClient;
