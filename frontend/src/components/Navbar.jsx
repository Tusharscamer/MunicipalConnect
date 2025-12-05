import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const staffRoles = ["clerk", "inspector", "dept_head", "team_leader"];
  
  const getDashboardRoute = () => {
    if (!user) return "/login";
    if (user.role === "super_admin") return "/super-admin";
    if (user.role === "admin") return "/admin";
    if (user.role === "team_member") return "/team-member";
    if (staffRoles.includes(user.role)) return "/staff";
    return "/citizen";
  };
  
  const dashboardRoute = getDashboardRoute();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-2xl border-b border-gray-700">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl transform transition-transform group-hover:scale-105">
          <span className="text-2xl">🏛️</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            e-Governance
          </h1>
          <p className="text-xs text-gray-400">Municipal Portal</p>
        </div>
      </Link>

      <div className="flex items-center gap-6 relative">
        <Link 
          to="/" 
          className="relative px-3 py-2 text-gray-300 hover:text-white transition-all group"
        >
          Home
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
        </Link>
        
        <Link 
          to="/dashboard" 
          className="relative px-3 py-2 text-gray-300 hover:text-white transition-all group"
        >
          Dashboard
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
        </Link>
        
        <Link 
          to="/requests/new" 
          className="relative px-3 py-2 text-gray-300 hover:text-white transition-all group"
        >
          New Request
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
        </Link>
        
        <Link 
          to="/contact" 
          className="relative px-3 py-2 text-gray-300 hover:text-white transition-all group"
        >
          Contact
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
        </Link>

        {user ? (
          <>
            <button
              className="flex items-center gap-3 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 px-4 py-2 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl group"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold uppercase text-white shadow-md">
                  {user.name?.charAt(0) || "C"}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{user.name?.split(" ")[0] || "Citizen"}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role?.replace("_", " ")}</p>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transform transition-transform ${menuOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-16 w-64 bg-gray-900 text-gray-300 rounded-xl shadow-2xl border border-gray-700 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-800 to-gray-900">
                    <p className="font-semibold text-white">{user.name || "User"}</p>
                    <p className="text-sm text-gray-400">{user.email || ""}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-all group"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span>My Profile</span>
                  </Link>
                  
                  <Link
                    to={dashboardRoute}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-all group"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span>My Dashboard</span>
                  </Link>
                  
                  {user?.role === "citizen" && (
                    <Link
                      to="/citizen"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-all group"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span>My Requests</span>
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-800 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-red-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link 
              to="/register" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-all hover:underline"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}