import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { 
  FiUser, FiMail, FiPhone, FiCheckCircle, 
  FiEdit2, FiSave, FiX, FiShield,
  FiCalendar, FiMapPin, FiGlobe
} from "react-icons/fi";

const API_BASE = "/api";

export default function Profile() {
  const { user, setAuthUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    requestsSubmitted: 0,
    requestsResolved: 0,
    avgResponseTime: "2 hours",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Initialize form with current user data
    setProfileData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    
    // Fetch user stats
    fetchUserStats();
  }, [user, navigate]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/users/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/auth/profile`,
        {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      // Update AuthContext with new user data
      if (response.data.user) {
        setAuthUser({
          ...user,
          name: response.data.user.name,
          email: response.data.user.email,
          phone: response.data.user.phone,
        });
      }
      
      // Refresh stats
      fetchUserStats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original user data
    setProfileData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      citizen: "Citizen",
      dept_head: "Department Head",
      team_leader: "Team Leader",
      team_member: "Team Member",
      admin: "Administrator",
      super_admin: "Super Administrator",
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      citizen: "bg-blue-100 text-blue-800",
      dept_head: "bg-purple-100 text-purple-800",
      team_leader: "bg-green-100 text-green-800",
      team_member: "bg-yellow-100 text-yellow-800",
      admin: "bg-red-100 text-red-800",
      super_admin: "bg-indigo-100 text-indigo-800",
    };
    return colorMap[role] || "bg-gray-100 text-gray-800";
  };

  if (!user) {
    return null;
  }

  const canEdit = user?.role === "citizen";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your account and track your civic engagement</p>
            </div>
            
            {!isEditing && canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {!canEdit && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-xl flex items-center gap-3">
              <FiShield className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Profile editing is restricted</p>
                <p className="text-sm">Please contact your administrator for changes to your profile information.</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Success/Error Messages */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-start gap-3">
                  <FiCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Update Failed</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 flex items-start gap-3">
                  <FiCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Success!</p>
                    <p className="text-sm">{success}</p>
                  </div>
                </div>
              )}

              {/* Profile Form */}
              <form onSubmit={handleSave} className="p-6 md:p-8">
                <div className="space-y-8">
                  {/* Personal Information Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                        <p className="text-gray-600 text-sm">Update your personal details</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FiUser className="w-4 h-4" />
                          Full Name
                        </label>
                        {isEditing && canEdit ? (
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            required
                          />
                        ) : (
                          <div className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3">
                            <p className="text-gray-900">{user.name || "Not set"}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FiMail className="w-4 h-4" />
                          Email Address
                        </label>
                        {isEditing && canEdit ? (
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            required
                          />
                        ) : (
                          <div className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3">
                            <p className="text-gray-900">{user.email || "Not set"}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FiPhone className="w-4 h-4" />
                          Phone Number
                        </label>
                        {isEditing && canEdit ? (
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        ) : (
                          <div className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3">
                            <p className="text-gray-900">{user.phone || "Not set"}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FiShield className="w-4 h-4" />
                          Account Role
                        </label>
                        <div className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(user.role)}`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Status Section */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <span className={`w-2 h-2 rounded-full ${user.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="font-medium">
                          {user.isActive !== false ? "Active" : "Disabled"}
                        </span>
                      </div>
                      {user.isActive !== false && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiCalendar className="w-4 h-4" />
                          <span className="text-sm">Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiSave className="w-4 h-4" />
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600">Requests Submitted</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.requestsSubmitted}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600">Requests Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.requestsResolved}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Response Time</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate("/new-request")}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors group"
                >
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                  <span className="font-medium">Submit New Request</span>
                </button>

                <button 
                  onClick={() => navigate("/dashboard")}
                  className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors group"
                >
                  <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200">
                    <FiGlobe className="w-5 h-5" />
                  </div>
                  <span className="font-medium">View Public Dashboard</span>
                </button>

                <button 
                  onClick={() => navigate("/my-requests")}
                  className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors group"
                >
                  <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <span className="font-medium">My Requests</span>
                </button>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Security Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use a strong, unique password</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Keep your contact information updated</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Log out from shared devices</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}