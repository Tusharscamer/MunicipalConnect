import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

/**
 * Custom hook for data fetching with advanced features
 * @param {string|Array} url - The URL to fetch or array of URLs for parallel fetching
 * @param {Object} options - Configuration options
 * @param {Object} options.params - Query parameters
 * @param {Object} options.headers - Additional headers
 * @param {boolean} options.manual - If true, fetch won't run automatically
 * @param {boolean} options.skip - If true, skip the fetch
 * @param {number} options.timeout - Request timeout in ms
 * @param {Function} options.onSuccess - Callback on successful fetch
 * @param {Function} options.onError - Callback on error
 * @returns {Object} Fetch state and controls
 */
export default function useFetch(url, options = {}) {
  const {
    params = {},
    headers = {},
    manual = false,
    skip = false,
    timeout = 10000,
    onSuccess,
    onError,
    initialData = null
  } = options;

  const [state, setState] = useState({
    data: initialData,
    loading: !manual && !skip,
    error: null,
    status: "idle", // 'idle' | 'loading' | 'success' | 'error'
    statusCode: null
  });

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Safe state update
  const safeSetState = useCallback((updates) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const buildHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    const defaultHeaders = {
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json",
    };

    return { ...defaultHeaders, ...headers };
  }, [headers]);

  const fetchData = useCallback(async (customUrl = url, customParams = params) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    safeSetState({
      loading: true,
      error: null,
      status: "loading",
      statusCode: null
    });

    try {
      const requestConfig = {
        headers: buildHeaders(),
        params: customParams,
        timeout,
        signal: abortControllerRef.current.signal,
      };

      const response = await axios.get(customUrl, requestConfig);
      
      if (isMountedRef.current) {
        const newState = {
          data: response.data,
          loading: false,
          status: "success",
          statusCode: response.status,
          error: null
        };

        setState(newState);

        if (onSuccess) {
          onSuccess(response.data);
        }

        console.log(`✅ Fetch successful: ${customUrl}`);
      }

      return { data: response.data, status: response.status };
    } catch (error) {
      if (!isMountedRef.current) return;

      // Handle abort errors
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('Request was cancelled');
        return;
      }

      let errorMessage = "An unexpected error occurred";
      let statusCode = error.response?.status;

      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      const errorState = {
        loading: false,
        error: errorMessage,
        status: "error",
        statusCode
      };

      safeSetState(errorState);

      if (onError) {
        onError(errorMessage, statusCode);
      }

      console.error(`❌ Fetch error (${customUrl}):`, errorMessage);

      return { error: errorMessage, statusCode };
    }
  }, [url, params, timeout, buildHeaders, onSuccess, onError, safeSetState]);

  // Refetch with new params
  const refetch = useCallback((newParams) => {
    return fetchData(url, newParams || params);
  }, [fetchData, url, params]);

  // Reset state
  const reset = useCallback(() => {
    safeSetState({
      data: initialData,
      loading: false,
      error: null,
      status: "idle",
      statusCode: null
    });
  }, [initialData, safeSetState]);

  // Automatically fetch on mount if not manual and not skipped
  useEffect(() => {
    if (!manual && !skip && url) {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [manual, skip, url, fetchData]);

  // Optimistic update helper
  const optimisticUpdate = useCallback((updater, rollbackOnError = true) => {
    const previousData = state.data;
    
    // Apply optimistic update
    const newData = typeof updater === 'function' 
      ? updater(previousData)
      : updater;
    
    safeSetState({ data: newData });

    // Return function to revert if needed
    return () => {
      if (rollbackOnError) {
        safeSetState({ data: previousData });
      }
    };
  }, [state.data, safeSetState]);

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,
    status: state.status,
    statusCode: state.statusCode,
    
    // Actions
    fetch: fetchData,
    refetch,
    reset,
    optimisticUpdate,
    
    // Derived state
    isIdle: state.status === "idle",
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    hasData: state.data !== null && state.data !== undefined,
    
    // Abort current request
    abort: () => abortControllerRef.current?.abort(),
  };
}

/**
 * Hook for POST/PUT/PATCH requests
 */
export function useMutate(url, method = "POST", options = {}) {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null,
    status: "idle"
  });

  const execute = useCallback(async (data, customUrl) => {
    setState({ loading: true, error: null, data: null, status: "loading" });

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json",
        ...options.headers
      };

      const response = await axios({
        method,
        url: customUrl || url,
        data,
        headers,
        timeout: options.timeout || 10000,
      });

      setState({
        loading: false,
        data: response.data,
        error: null,
        status: "success"
      });

      if (options.onSuccess) {
        options.onSuccess(response.data);
      }

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Request failed";

      setState({
        loading: false,
        error: errorMessage,
        data: null,
        status: "error"
      });

      if (options.onError) {
        options.onError(errorMessage);
      }

      return { success: false, error: errorMessage };
    }
  }, [url, method, options]);

  return {
    ...state,
    execute,
    isIdle: state.status === "idle",
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
  };
}