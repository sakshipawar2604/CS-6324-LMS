import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080", // Spring Boot later
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// attach JWT when available
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("user");
  if (raw) {
    const { token } = JSON.parse(raw) || {};
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
