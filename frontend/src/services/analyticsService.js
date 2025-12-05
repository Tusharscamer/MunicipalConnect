import apiClient from "./apiClient";

export const getDepartmentAnalytics = () => apiClient.get("/analytics/department");

