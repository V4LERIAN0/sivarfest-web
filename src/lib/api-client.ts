import axios from "axios";
import { getServerApiUrl } from "./api-url";

export const apiClient = axios.create({
  // Cookies must be issued to the host displaying the login form (including www).
  // The absolute URL is only used during server rendering.
  baseURL: typeof window === "undefined" ? getServerApiUrl() : "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
