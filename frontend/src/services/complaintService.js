// frontend/src/services/complaintService.js
import apiClient from "./apiClient";

export const createComplaint = (formData) =>
  apiClient.post("/complaints", formData);

export const fetchMyComplaints = () => apiClient.get("/complaints/my");
export const fetchComplaintById = (id) => apiClient.get(`/complaints/${id}`);
export const fetchAllComplaints = () => apiClient.get("/complaints"); // admin only
export const deleteComplaint = (id) => apiClient.delete(`/complaints/${id}`); // admin only
