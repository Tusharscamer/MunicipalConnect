import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import useFetch from "./useFetch";
import { useMutate } from "./useFetch";

/**
 * Enhanced requests hook with advanced filtering, pagination, and real-time features
 * @param {Object} initialFilters - Initial filter parameters
 * @param {Object} options - Additional options
 * @returns {Object} Requests state and management functions
 */
export default function useRequests(initialFilters = {}, options = {}) {
  const {
    autoFetch = true,
    pageSize = 10,
    enablePagination = true,
    enableWebSocket = false,
    cacheTime = 30000, // 30 seconds
    onRequestCreated,
    onRequestUpdated,
    onRequestDeleted
  } = options;

  // State management
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  const [selectedRequests, setSelectedRequests] = useState(new Set());
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cache, setCache] = useState({});

  // Build query URL
  const buildQueryUrl = useCallback((customFilters = filters, customPagination = pagination) => {
    const queryParams = new URLSearchParams();
    
    // Add filters
    Object.entries(customFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });
    
    // Add pagination if enabled
    if (enablePagination) {
      queryParams.append('page', customPagination.page);
      queryParams.append('limit', customPagination.limit);
    }
    
    const queryString = queryParams.toString();
    return `/api/requests${queryString ? `?${queryString}` : ''}`;
  }, [filters, pagination, enablePagination]);

  // Main fetch hook
  const {
    data: response,
    loading,
    error,
    status,
    fetch: fetchRequests,
    refetch,
    reset: resetFetch,
    optimisticUpdate
  } = useFetch(
    autoFetch ? buildQueryUrl() : null,
    {
      manual: !autoFetch,
      onSuccess: (data) => {
        setLastUpdated(new Date());
        
        // Update pagination from response
        if (data.pagination) {
          setPagination(data.pagination);
        }
        
        // Cache the response
        if (cacheTime > 0) {
          const cacheKey = buildQueryUrl();
          setCache(prev => ({
            ...prev,
            [cacheKey]: {
              data,
              timestamp: Date.now()
            }
          }));
        }
      },
      onError: (errorMsg) => {
        toast.error(`Failed to load requests: ${errorMsg}`);
      }
    }
  );

  // Extract requests and stats from response
  const { requests = [], stats = {}, pagination: responsePagination } = response || {};
  
  // Update pagination when response changes
  useEffect(() => {
    if (responsePagination) {
      setPagination(responsePagination);
    }
  }, [responsePagination]);

  // Mutation hooks for CRUD operations
  const createRequest = useMutate('/api/requests', 'POST', {
    onSuccess: (data) => {
      toast.success('Request created successfully!');
      if (onRequestCreated) onRequestCreated(data);
      refetch(); // Refresh the list
    },
    onError: (errorMsg) => {
      toast.error(`Failed to create request: ${errorMsg}`);
    }
  });

  const updateRequest = useMutate('/api/requests/{id}', 'PUT', {
    onSuccess: (data) => {
      toast.success('Request updated successfully!');
      if (onRequestUpdated) onRequestUpdated(data);
      
      // Optimistic update local state
      optimisticUpdate((prevData) => {
        if (!prevData?.requests) return prevData;
        return {
          ...prevData,
          requests: prevData.requests.map(req => 
            req._id === data._id ? data : req
          )
        };
      });
    },
    onError: (errorMsg) => {
      toast.error(`Failed to update request: ${errorMsg}`);
    }
  });

  const deleteRequest = useMutate('/api/requests/{id}', 'DELETE', {
    onSuccess: (data) => {
      toast.success('Request deleted successfully!');
      if (onRequestDeleted) onRequestDeleted(data);
      
      // Optimistic update local state
      optimisticUpdate((prevData) => {
        if (!prevData?.requests) return prevData;
        return {
          ...prevData,
          requests: prevData.requests.filter(req => req._id !== data._id)
        };
      });
    },
    onError: (errorMsg) => {
      toast.error(`Failed to delete request: ${errorMsg}`);
    }
  });

  // Filter management
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (autoFetch) {
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    }
  }, [autoFetch]);

  const clearFilters = useCallback(() => {
    setFilters({
      status: '',
      category: '',
      priority: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    if (autoFetch) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [autoFetch]);

  // Pagination controls
  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.hasNext]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [pagination.hasPrev]);

  // Selection management
  const toggleSelect = useCallback((id) => {
    setSelectedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedRequests.size === requests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(requests.map(req => req._id)));
    }
  }, [requests]);

  const clearSelection = useCallback(() => {
    setSelectedRequests(new Set());
  }, []);

  // Bulk actions
  const bulkUpdateStatus = useCallback(async (status) => {
    if (selectedRequests.size === 0) {
      toast.error('No requests selected');
      return;
    }

    const requestIds = Array.from(selectedRequests);
    const updatePromises = requestIds.map(id =>
      updateRequest.execute({ status }, `/api/requests/${id}`)
    );

    try {
      await Promise.all(updatePromises);
      toast.success(`Updated ${requestIds.length} request(s)`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to update some requests');
    }
  }, [selectedRequests, updateRequest, clearSelection]);

  // Search with debounce
  const searchRequests = useCallback((searchTerm) => {
    updateFilter('search', searchTerm);
  }, [updateFilter]);

  // Sort requests
  const sortRequests = useCallback((sortBy, sortOrder = 'desc') => {
    updateFilter('sortBy', sortBy);
    updateFilter('sortOrder', sortOrder);
  }, [updateFilter]);

  // Group requests by status
  const groupedRequests = useMemo(() => {
    return requests.reduce((groups, request) => {
      const status = request.status || 'Unknown';
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(request);
      return groups;
    }, {});
  }, [requests]);

  // Filtered requests (client-side filtering if needed)
  const filteredRequests = useMemo(() => {
    // Server-side filtering is preferred, but this is for client-side additional filtering
    return requests.filter(request => {
      // Add any client-side filtering logic here
      return true;
    });
  }, [requests]);

  // Export data
  const exportData = useCallback((format = 'json') => {
    const data = {
      requests,
      filters,
      pagination,
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      const exportFileDefaultName = `requests_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
    
    toast.success(`Exported ${requests.length} requests`);
  }, [requests, filters, pagination]);

  // Refresh data with loading indicator
  const refresh = useCallback(async () => {
    toast.loading('Refreshing requests...');
    await refetch();
    toast.dismiss();
    toast.success('Requests refreshed!');
  }, [refetch]);

  return {
    // Data
    requests,
    filteredRequests,
    groupedRequests,
    stats,
    
    // State
    loading,
    error,
    status,
    filters,
    pagination,
    selectedRequests: Array.from(selectedRequests),
    lastUpdated,
    
    // Selection
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected: (id) => selectedRequests.has(id),
    selectedCount: selectedRequests.size,
    
    // Filtering
    updateFilter,
    clearFilters,
    searchRequests,
    sortRequests,
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    
    // CRUD Operations
    createRequest: createRequest.execute,
    updateRequest: (id, data) => updateRequest.execute(data, `/api/requests/${id}`),
    deleteRequest: (id) => deleteRequest.execute(null, `/api/requests/${id}`),
    bulkUpdateStatus,
    
    // Export
    exportData,
    
    // Refresh
    refetch,
    refresh,
    reset: resetFetch,
    
    // Loading states
    isCreating: createRequest.loading,
    isUpdating: updateRequest.loading,
    isDeleting: deleteRequest.loading,
    
    // Derived values
    hasRequests: requests.length > 0,
    isEmpty: requests.length === 0,
    totalCount: pagination.total || requests.length,
    
    // Cache info
    cacheSize: Object.keys(cache).length,
    clearCache: () => setCache({}),
    
    // Helper functions
    getRequestById: (id) => requests.find(req => req._id === id),
    getRequestsByStatus: (status) => requests.filter(req => req.status === status),
    getUrgentRequests: () => requests.filter(req => req.priority === 'high'),
    
    // UI helpers
    statusColors: {
      'Submitted': 'blue',
      'InProgress': 'yellow',
      'Resolved': 'green',
      'Closed': 'gray',
      'Rejected': 'red'
    }
  };
}

/**
 * Hook for single request management
 */
export function useSingleRequest(requestId, options = {}) {
  const {
    autoFetch = true,
    enableUpdates = true,
    pollInterval = 0 // 0 = no polling
  } = options;

  const {
    data: request,
    loading,
    error,
    refetch,
    status,
    optimisticUpdate
  } = useFetch(
    autoFetch && requestId ? `/api/requests/${requestId}` : null,
    {
      manual: !autoFetch,
      pollInterval,
      onError: (errorMsg) => {
        console.error(`Failed to load request ${requestId}:`, errorMsg);
      }
    }
  );

  const updateMutation = useMutate(`/api/requests/${requestId}`, 'PUT', {
    onSuccess: (data) => {
      toast.success('Request updated successfully!');
    },
    onError: (errorMsg) => {
      toast.error(`Failed to update request: ${errorMsg}`);
    }
  });

  const addComment = useCallback(async (comment) => {
    if (!requestId) return;
    
    const response = await updateMutation.execute({
      ...request,
      comments: [...(request?.comments || []), {
        text: comment,
        userId: localStorage.getItem('userId'),
        userName: localStorage.getItem('userName'),
        timestamp: new Date().toISOString()
      }]
    });

    return response;
  }, [requestId, request, updateMutation]);

  const updateStatus = useCallback(async (newStatus, notes = '') => {
    if (!requestId) return;
    
    const response = await updateMutation.execute({
      status: newStatus,
      statusNotes: notes,
      updatedAt: new Date().toISOString()
    });

    return response;
  }, [requestId, updateMutation]);

  return {
    request,
    loading,
    error,
    status,
    refetch,
    
    // Actions
    update: updateMutation.execute,
    addComment,
    updateStatus,
    
    // Optimistic updates
    optimisticUpdate,
    
    // Derived state
    canEdit: !loading && request && request.status !== 'Closed',
    canComment: !loading && request,
    isResolved: request?.status === 'Resolved' || request?.status === 'Closed',
    isUrgent: request?.priority === 'high',
    
    // Timeline helpers
    getTimeline: () => {
      if (!request) return [];
      
      const timeline = [];
      
      // Creation
      if (request.createdAt) {
        timeline.push({
          type: 'created',
          timestamp: request.createdAt,
          user: request.createdBy,
          description: 'Request submitted'
        });
      }
      
      // Status changes
      if (request.statusHistory) {
        timeline.push(...request.statusHistory.map(change => ({
          type: 'status_change',
          timestamp: change.timestamp,
          status: change.status,
          notes: change.notes,
          user: change.updatedBy
        })));
      }
      
      // Comments
      if (request.comments) {
        timeline.push(...request.comments.map(comment => ({
          type: 'comment',
          timestamp: comment.timestamp,
          user: comment.userName,
          text: comment.text
        })));
      }
      
      return timeline.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
    }
  };
}