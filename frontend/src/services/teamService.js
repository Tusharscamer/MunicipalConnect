import apiClient from "./apiClient";

export const getDepartmentMembers = (departmentId) =>
  apiClient.get(`/teams/departments/${departmentId}/members`);

export const getDepartmentTeams = () => apiClient.get("/teams/departments/teams");

export const createTeam = (data) => apiClient.post("/teams", data);

export const getMyTeams = () => apiClient.get("/teams/my-teams");

export const getMyTeamInfo = () => apiClient.get("/teams/my-team-info");

export const getTeamById = (id) => apiClient.get(`/teams/${id}`);

export const updateTeam = (id, data) => apiClient.put(`/teams/${id}`, data);

export const reassignTeamLeader = (id, newLeaderId) =>
  apiClient.put(`/teams/${id}/reassign-leader`, { newLeaderId });

export const deleteTeam = (id) => apiClient.delete(`/teams/${id}`);

