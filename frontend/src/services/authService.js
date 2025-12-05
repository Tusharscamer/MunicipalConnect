import apiClient from "./apiClient";

export const login = async (email, password) => {
  const res = await apiClient.post("/auth/login", { email, password });
  return res.data; // { token }
};

export const register = async (userData) => {
  const res = await apiClient.post("/auth/register", userData);
  return res.data; // { token }
};

export const getMe = async () => {
  const res = await apiClient.get("/auth/me");
  return res.data; // user object
};
