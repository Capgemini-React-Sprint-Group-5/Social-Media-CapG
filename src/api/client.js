import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to unwrap data
client.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default client;