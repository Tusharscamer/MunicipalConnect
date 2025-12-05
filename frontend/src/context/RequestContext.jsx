import { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import apiClient from "../services/apiClient";

export const RequestContext = createContext();

export function RequestProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    categories: {}
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch requests with advanced filtering
  const fetchRequests = useCallback(async (customFilters = {}) => {
    const mergedFilters = { ...filters, ...customFilters, page: pagination.page, limit: pagination.limit };
    
    setLoading(true);
    setError(null);
    
    try {
      const queryString = new URLSearchParams(
        Object.entries(mergedFilters).filter(([_, value]) => value !== '')
      ).toString();
      
      
      const res = await apiClient.get(`/requests?${queryString}`);

const payload = res.data;

// ALWAYS turn into array
const requestsArray = Array.isArray(payload)
  ? payload
  : (payload.requests || []);

setRequests(requestsArray);

// Update pagination
if (payload.pagination) setPagination(payload.pagination);

// Update stats
if (payload.stats) setStats(payload.stats);

      
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.response?.data?.message || "Failed to fetch requests");
      
      toast.error(err.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Load initial data
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Add new request
  const addRequest = async (newRequest) => {
    try {
      setLoading(true);
      const res = await apiClient.post("/requests", newRequest);
      
      setRequests(prev => [res.data, ...prev]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1
      }));
      
      toast.success("Request submitted successfully!");
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to submit request";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update existing request
  const updateRequest = async (id, updates) => {
    try {
      setLoading(true);
      const res = await apiClient.put(`/requests/${id}`, updates);
      
      setRequests(prev =>
        prev.map((req) => (req._id === id ? res.data : req))
      );
      
      // Update stats if status changed
      if (updates.status) {
        setStats(prev => {
          const updated = { ...prev };
          // This is a simplified update - in production, you'd want more sophisticated logic
          return updated;
        });
      }
      
      toast.success("Request updated successfully!");
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update request";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Delete request
  const deleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) {
      return;
    }
    
    try {
      setLoading(true);
      await apiClient.delete(`/requests/${id}`);
      
      setRequests(prev => prev.filter(req => req._id !== id));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
      
      toast.success("Request deleted successfully!");
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete request";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Bulk actions
  const bulkUpdate = async (ids, updates) => {
    try {
      setLoading(true);
      const res = await apiClient.put("/requests/bulk", { ids, updates });
      
      // Update local state
      setRequests(prev =>
        prev.map(req => 
          ids.includes(req._id) ? { ...req, ...updates } : req
        )
      );
      
      toast.success(`${ids.length} requests updated successfully!`);
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update requests";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Pagination controls
  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const nextPage = () => {
    if (pagination.hasNext) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const prevPage = () => {
    if (pagination.hasPrev) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      priority: '',
      dateFrom: '',
      dateTo: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Get request by ID
  const getRequestById = (id) => {
    return requests.find(req => req._id === id);
  };

  // Search requests
  const searchRequests = async (searchTerm) => {
    await fetchRequests({ search: searchTerm, page: 1 });
  };

  return (
    <RequestContext.Provider
      value={{
        // Data
        requests,
        stats,
        loading,
        error,
        pagination,
        filters,
        
        // Actions
        fetchRequests,
        addRequest,
        updateRequest,
        deleteRequest,
        bulkUpdate,
        
        // Pagination
        goToPage,
        nextPage,
        prevPage,
        
        // Filtering
        setFilters,
        clearFilters,
        searchRequests,
        
        // Utilities
        getRequestById,
        setError: (errorMsg) => setError(errorMsg),
        clearError: () => setError(null)
      }}
    >
      {children}
    </RequestContext.Provider>
  );
}