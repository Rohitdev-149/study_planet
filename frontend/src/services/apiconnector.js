import axios from "axios";

// Set a default baseURL to ensure the browser always has a valid host.
export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1",
  withCredentials: true,
});

// Debugging: log request URL and method for diagnostics
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("[axios] Request ->", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.log("[axios] Request Error ->", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(
      "[axios] Response Error ->",
      error && error.config
        ? `${error.config.method?.toUpperCase()} ${error.config.url}`
        : error
    );
    return Promise.reject(error);
  }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
};
