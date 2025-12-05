import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // Initialize axios with auth token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Map roles to permissions
  const getRolePermissions = useCallback((role) => {
    const permissionsMap = {
      super_admin: ['*'],
      admin: ['manage_users', 'manage_requests', 'view_reports', 'assign_tasks'],
      dept_head: ['manage_team', 'approve_requests', 'view_department_stats'],
      team_leader: ['assign_tasks', 'review_requests', 'update_status'],
      inspector: ['inspect_requests', 'submit_reports'],
      clerk: ['create_requests', 'update_basic_info', 'view_requests'],
      team_member: ['work_on_tasks', 'submit_updates'],
      citizen: ['create_requests', 'view_own_requests', 'track_status']
    };
    return permissionsMap[role] || ['view_own_requests'];
  }, []);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }, [user, permissions]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setAuthError(null);
      
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });
      
      const userData = response.data;
      setUser(userData);
      setPermissions(getRolePermissions(userData.role));
      
      // Store user role in localStorage for quick access
      localStorage.setItem("userRole", userData.role);
      
    } catch (error) {
      console.error("Auth error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else if (error.code === 'ECONNABORTED') {
        setAuthError("Connection timeout. Please check your internet.");
        toast.error("Server is taking too long to respond");
      } else {
        setAuthError("Failed to load user profile");
      }
      
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [getRolePermissions]);

  // Initial auth check
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const response = await axios.post("/api/auth/login", {
        email,
        password
      }, {
        timeout: 10000
      });
      
      const { token, user: userData } = response.data;
      
      // Store token
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", userData.role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setUser(userData);
      setPermissions(getRolePermissions(userData.role));
      
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true, user: userData };
      
    } catch (error) {
      const message = error.response?.data?.message || 
                     error.code === 'ECONNABORTED' ? 
                     "Login timeout. Please try again." : 
                     "Invalid email or password";
      
      setAuthError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("theme");
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
    setPermissions([]);
    setAuthError(null);
    
    toast.success("Successfully logged out");
    
    // Optional: Clear all toast notifications
    toast.dismiss();
  };

  // Manual user update
  const setAuthUser = (userData) => {
    setUser(userData);
    if (userData?.role) {
      setPermissions(getRolePermissions(userData.role));
      localStorage.setItem("userRole", userData.role);
    }
  };

  // Refresh user data
  const refreshUser = () => {
    fetchUserProfile();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        loading, 
        authError,
        permissions,
        hasPermission,
        setAuthUser,
        refreshUser,
        clearError: () => setAuthError(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}