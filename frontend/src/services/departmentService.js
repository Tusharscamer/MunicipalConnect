import apiClient from "./apiClient";

export const fetchDepartments = () => apiClient.get("/departments");


