import apiClient from "./apiClient";

export const createPayment = (requestId, amount) =>
  apiClient.post("/payments", { requestId, amount });

export const fetchPayments = () => apiClient.get("/payments");
