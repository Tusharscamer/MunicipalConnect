import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Enhanced authentication hook with role-based utilities
 * @returns {Object} Authentication state and utilities
 */
export default function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Memoize computed values
  const authUtils = useMemo(() => {
    const {
      user,
      permissions = [],
      hasPermission: contextHasPermission,
      ...rest
    } = context;

    // Check authentication status
    const isAuthenticated = !!user;
    const isGuest = !user;
    
    // Role checks
    const hasRole = (role) => user?.role === role;
    const hasAnyRole = (roles) => roles.includes(user?.role);
    const hasAllRoles = (roles) => roles.every(role => user?.roles?.includes(role));
    
    // Permission checks (fallback if context doesn't have hasPermission)
    const hasPermission = contextHasPermission || ((permission) => {
      if (!user) return false;
      if (permissions.includes('*')) return true;
      return permissions.includes(permission);
    });
    
    const hasAnyPermission = (permissionsList) => {
      if (!user) return false;
      if (permissions.includes('*')) return true;
      return permissionsList.some(permission => permissions.includes(permission));
    };
    
    // User info helpers
    const isStaff = user?.role && ["clerk", "inspector", "dept_head", "team_leader", "admin", "super_admin"].includes(user.role);
    const isAdmin = user?.role && ["admin", "super_admin"].includes(user.role);
    const isSuperAdmin = user?.role === "super_admin";
    const isCitizen = user?.role === "citizen";
    
    // Dashboard routing
    const getDashboardRoute = () => {
      if (!user) return "/login";
      if (hasRole("super_admin")) return "/super-admin";
      if (hasRole("admin")) return "/admin";
      if (hasRole("team_member")) return "/team-member";
      if (isStaff) return "/staff";
      return "/citizen";
    };

    // User display helpers
    const getUserInitials = () => {
      if (!user?.name) return "U";
      return user.name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const getDisplayName = () => {
      if (!user?.name) return "Guest";
      return user.name.split(" ")[0];
    };

    // Role display
    const getRoleDisplay = () => {
      if (!user?.role) return "Guest";
      const roleMap = {
        super_admin: "Super Administrator",
        admin: "Administrator",
        dept_head: "Department Head",
        team_leader: "Team Leader",
        inspector: "Inspector",
        clerk: "Clerk",
        team_member: "Team Member",
        citizen: "Citizen"
      };
      return roleMap[user.role] || user.role.replace("_", " ");
    };

    return {
      // Original context
      ...rest,
      user,
      permissions,
      
      // Authentication state
      isAuthenticated,
      isGuest,
      
      // Role checks
      hasRole,
      hasAnyRole,
      hasAllRoles,
      
      // Permission checks
      hasPermission,
      hasAnyPermission,
      
      // User type checks
      isStaff,
      isAdmin,
      isSuperAdmin,
      isCitizen,
      
      // Routing
      getDashboardRoute,
      dashboardRoute: getDashboardRoute(),
      
      // Display helpers
      getUserInitials,
      getDisplayName,
      getRoleDisplay,
      
      // Quick access
      userId: user?._id || user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      userName: user?.name,
      
      // Shortcuts for common permissions
      canCreate: hasPermission("create_requests") || hasRole("citizen") || hasRole("clerk"),
      canEdit: hasPermission("update_requests") || isStaff,
      canDelete: hasPermission("delete_requests") || isAdmin,
      canAssign: hasPermission("assign_tasks") || hasAnyRole(["admin", "dept_head", "team_leader"]),
      canApprove: hasPermission("approve_requests") || hasAnyRole(["admin", "dept_head"]),
    };
  }, [context]);

  return authUtils;
}

/**
 * Hook for protecting routes/components
 */
export function useRequireAuth(requiredRole = null, requiredPermission = null) {
  const auth = useAuth();
  
  if (auth.loading) {
    return { authorized: false, loading: true, auth };
  }
  
  if (!auth.isAuthenticated) {
    return { authorized: false, loading: false, auth, reason: "not_authenticated" };
  }
  
  if (requiredRole && !auth.hasRole(requiredRole)) {
    return { authorized: false, loading: false, auth, reason: "insufficient_role" };
  }
  
  if (requiredPermission && !auth.hasPermission(requiredPermission)) {
    return { authorized: false, loading: false, auth, reason: "insufficient_permission" };
  }
  
  return { authorized: true, loading: false, auth };
}

/**
 * Hook for auth-based UI state
 */
export function useAuthUI() {
  const auth = useAuth();
  
  return useMemo(() => {
    if (auth.loading) {
      return {
        variant: "loading",
        theme: "gray",
        icon: "⏳",
        message: "Checking authentication...",
        showLoginButton: false,
        showRegisterButton: false,
        showDashboardButton: false,
      };
    }
    
    if (!auth.isAuthenticated) {
      return {
        variant: "guest",
        theme: "blue",
        icon: "👤",
        message: "Please login to continue",
        showLoginButton: true,
        showRegisterButton: true,
        showDashboardButton: false,
      };
    }
    
    // Authenticated user
    return {
      variant: "authenticated",
      theme: auth.isAdmin ? "purple" : "green",
      icon: auth.isAdmin ? "👑" : "✅",
      message: `Welcome, ${auth.getDisplayName()}!`,
      showLoginButton: false,
      showRegisterButton: false,
      showDashboardButton: true,
      userBadge: {
        initials: auth.getUserInitials(),
        role: auth.getRoleDisplay(),
        color: auth.isAdmin ? "purple" : "blue"
      }
    };
  }, [auth]);
}