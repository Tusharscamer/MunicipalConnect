import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useContext, Suspense, lazy } from "react";
import { AuthContext } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBoundary from "../components/ErrorBoundary";
// Lazy load pages for better performance
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const CitizenDashboard = lazy(() => import("../pages/CitizenDashboard"));
const PublicDashboard = lazy(() => import("../pages/PublicDashboard"));
const StaffDashboard = lazy(() => import("../pages/StaffDashboard"));
const TeamMemberDashboard = lazy(() => import("../pages/TeamMemberDashboard"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("../pages/SuperAdminDashboard"));
const RequestDetail = lazy(() => import("../pages/RequestDetail"));
const NewRequest = lazy(() => import("../pages/NewRequest"));
const PaymentPage = lazy(() => import("../pages/PaymentPage"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = "/login" }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    let redirectPath = "/";
    switch(user.role) {
      case 'citizen': redirectPath = '/citizen'; break;
      case 'clerk':
      case 'inspector':
      case 'dept_head':
      case 'team_leader': redirectPath = '/staff'; break;
      case 'team_member': redirectPath = '/team-member'; break;
      case 'admin': redirectPath = '/admin'; break;
      case 'super_admin': redirectPath = '/super-admin'; break;
      default: redirectPath = '/';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Public Only Route (for login/register when already logged in)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (user) {
    // Redirect to appropriate dashboard based on role
    let redirectPath = "/";
    switch(user.role) {
      case 'citizen': redirectPath = '/citizen'; break;
      case 'clerk':
      case 'inspector':
      case 'dept_head':
      case 'team_leader': redirectPath = '/staff'; break;
      case 'team_member': redirectPath = '/team-member'; break;
      case 'admin': redirectPath = '/admin'; break;
      case 'super_admin': redirectPath = '/super-admin'; break;
      default: redirectPath = '/';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Main Layout wrapper for all protected routes
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </div>
  );
};

export default function AppRouter() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <Suspense 
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<PublicDashboard />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
          
          {/* Auth Routes (Public Only) */}
          <Route path="/login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          } />

          {/* Protected Routes with Layout */}
          <Route element={<MainLayout />}>
            {/* Citizen Routes */}
            <Route path="/citizen" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            } />
            <Route path="/requests/new" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <NewRequest />
              </ProtectedRoute>
            } />
            <Route path="/payments/:id" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <PaymentPage />
              </ProtectedRoute>
            } />

            {/* Staff Routes (multiple roles) */}
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={['clerk', 'inspector', 'dept_head', 'team_leader']}>
                <StaffDashboard />
              </ProtectedRoute>
            } />

            {/* Team Member Routes */}
            <Route path="/team-member" element={
              <ProtectedRoute allowedRoles={['team_member']}>
                <TeamMemberDashboard />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />

            {/* Profile (accessible by all authenticated users) */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

<Route path="/requests/:id" element={
  <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
    <RequestDetail />
  </ErrorBoundary>
} />