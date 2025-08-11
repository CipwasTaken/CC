import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // <-- add this line
  },
});

export default api;
