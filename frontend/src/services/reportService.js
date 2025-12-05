import apiClient from "./apiClient";

// Fetch dashboard KPIs for admin or department head
export const fetchKPIs = async () => {
  const res = await apiClient.get("/reports/kpis");
  return res.data; // Example: { totalRequests, resolved, pending, highPriority }
};

// Fetch reports filtered by department, status, or zone
export const fetchReport = async (filters = {}) => {
  const res = await apiClient.get("/reports", { params: filters });
  return res.data; // Example: [{ requestId, status, assignedTo, createdAt }]
};
