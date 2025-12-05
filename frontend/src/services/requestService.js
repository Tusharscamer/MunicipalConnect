import apiClient from "./apiClient";

export const fetchRequests = (filter = {}) =>
  apiClient.get("/requests", { params: filter });

export const getRequests = (filter = {}) =>
  apiClient.get("/requests", { params: filter });

export const fetchRequestById = (id) => apiClient.get(`/requests/${id}`);

export const createRequest = (formData) =>
  apiClient.post("/requests", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateRequestStatus = (id, status, message = "") =>
  apiClient.put(`/requests/${id}/status`, { status, message });

export const validateRequest = (id, payload) =>
  apiClient.post(`/requests/${id}/validate`, payload);

export const assignTeamLeader = (id, payload) =>
  apiClient.post(`/requests/${id}/assign`, payload);

export const addTask = (id, payload) => apiClient.post(`/requests/${id}/tasks`, payload);

export const updateTask = (id, taskId, payload) =>
  apiClient.patch(`/requests/${id}/tasks/${taskId}`, payload);

export const submitCompletion = (id, formData) =>
  apiClient.post(`/requests/${id}/completion`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const verifyCompletion = (id, payload) =>
  apiClient.post(`/requests/${id}/verify`, payload);

export const mergeRequests = (payload) => apiClient.post("/requests/merge", payload);

export const supportRequest = (id) => apiClient.post(`/requests/${id}/support`);

export const submitCitizenFeedback = (id, payload) =>
  apiClient.post(`/requests/${id}/feedback`, payload);

export const findSimilar = (payload) =>
  apiClient.post("/requests/similar", payload);