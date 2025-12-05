import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import {
  Building2,
  Users,
  Shield,
  UserPlus,
  UsersRound,
  Pencil,
  Key,
  Trash2,
  RefreshCw,
  ChevronRight,
  Filter,
  Search,
  BarChart3,
  UserCog,
  Eye,
  EyeOff,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Lock,
  Building,
  Settings,
  Download,
  Plus,
  ArrowRightLeft,
  Sparkles
} from "lucide-react";

const API_BASE = "/api";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data states
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalTeams: 0,
    totalStaff: 0,
    activeStaff: 0,
    teamLeaders: 0,
    departmentHeads: 0
  });

  // Form states
  const [deptHeadForm, setDeptHeadForm] = useState({ name: "", email: "", phone: "", password: "", departmentId: "", showPassword: false });
  const [teamForm, setTeamForm] = useState({ name: "", departmentId: "", leaderId: "" });
  const [teamLeaderForm, setTeamLeaderForm] = useState({ name: "", email: "", phone: "", password: "", departmentId: "", showPassword: false });
  const [teamMemberForm, setTeamMemberForm] = useState({ name: "", email: "", phone: "", password: "", departmentId: "", teamId: "", skills: "", showPassword: false });
  const [moveStaffForm, setMoveStaffForm] = useState({ userId: "", departmentId: "", teamId: "" });
  const [editStaffForm, setEditStaffForm] = useState({ userId: "", name: "", email: "", phone: "" });
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editTeamForm, setEditTeamForm] = useState({ teamId: "", name: "", leaderId: "", departmentId: "" });
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [resettingPasswordFor, setResettingPasswordFor] = useState(null);
  const [passwordResetForm, setPasswordResetForm] = useState({ newPassword: "", confirmPassword: "", showPassword: false, showConfirmPassword: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [deptsRes, teamsRes, staffRes] = await Promise.all([
        axios.get(`${API_BASE}/super-admin/departments`, { headers }),
        axios.get(`${API_BASE}/super-admin/teams`, { headers }),
        axios.get(`${API_BASE}/super-admin/staff`, { headers }),
      ]);

      setDepartments(deptsRes.data.departments || []);
      setTeams(teamsRes.data.teams || []);
      const staffData = staffRes.data.staff || [];
      setStaff(staffData);

      // Calculate stats
      setStats({
        totalDepartments: deptsRes.data.departments?.length || 0,
        totalTeams: teamsRes.data.teams?.length || 0,
        totalStaff: staffData.length,
        activeStaff: staffData.filter(s => s.isActive).length,
        teamLeaders: staffData.filter(s => s.role === "team_leader").length,
        departmentHeads: staffData.filter(s => s.role === "dept_head").length
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeptHead = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/super-admin/create-dept-head`, {
        ...deptHeadForm,
        password: deptHeadForm.password
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Department Head created successfully!");
      setDeptHeadForm({ name: "", email: "", phone: "", password: "", departmentId: "", showPassword: false });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create Department Head");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/super-admin/create-team`, teamForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Team created successfully!");
      setTeamForm({ name: "", departmentId: "", leaderId: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamLeader = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/super-admin/add-team-leader`, {
        ...teamLeaderForm,
        password: teamLeaderForm.password
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Team Leader created successfully!");
      setTeamLeaderForm({ name: "", email: "", phone: "", password: "", departmentId: "", showPassword: false });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create Team Leader");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = {
        ...teamMemberForm,
        skills: teamMemberForm.skills ? teamMemberForm.skills.split(",").map(s => s.trim()) : [],
        password: teamMemberForm.password
      };
      await axios.post(`${API_BASE}/super-admin/add-team-member`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Team Member created successfully!");
      setTeamMemberForm({ name: "", email: "", phone: "", password: "", departmentId: "", teamId: "", skills: "", showPassword: false });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create Team Member");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStaff = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/super-admin/move-staff/${moveStaffForm.userId}`, {
        departmentId: moveStaffForm.departmentId,
        teamId: moveStaffForm.teamId || undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Staff moved successfully!");
      setMoveStaffForm({ userId: "", departmentId: "", teamId: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to move staff");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = async (userId, hardDelete = false) => {
    if (!window.confirm(`Are you sure you want to ${hardDelete ? "permanently delete" : "disable"} this staff member?`)) {
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/super-admin/remove-staff/${userId}?hardDelete=${hardDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(`Staff member ${hardDelete ? "deleted" : "disabled"} successfully!`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove staff");
    } finally {
      setLoading(false);
    }
  };

  const handleEnableStaff = async (userId) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/super-admin/enable-staff/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Staff member enabled successfully!");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enable staff member");
    } finally {
      setLoading(false);
    }
  };

  const startEditTeam = (team) => {
    setEditTeamForm({
      teamId: team._id,
      name: team.name || "",
      leaderId: team.leader?._id || "",
      departmentId: team.department?._id || "",
    });
    setIsEditingTeam(true);
    setError("");
    setSuccess("");
  };

  const handleEditTeam = async (e) => {
    e.preventDefault();
    if (!editTeamForm.teamId) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { name: editTeamForm.name };
      if (editTeamForm.leaderId) {
        payload.leaderId = editTeamForm.leaderId;
      }
      await axios.put(
        `${API_BASE}/super-admin/teams/${editTeamForm.teamId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Team updated successfully!");
      setIsEditingTeam(false);
      setEditTeamForm({ teamId: "", name: "", leaderId: "", departmentId: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team? This cannot be undone.")) {
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/super-admin/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Team deleted successfully!");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete team");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!resettingPasswordFor) return;
    
    if (passwordResetForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    if (passwordResetForm.newPassword !== passwordResetForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/super-admin/reset-password/${resettingPasswordFor}`, {
        newPassword: passwordResetForm.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(`Password reset successfully for ${staff.find(s => s._id === resettingPasswordFor)?.name || "user"}!`);
      setResettingPasswordFor(null);
      setPasswordResetForm({ newPassword: "", confirmPassword: "", showPassword: false, showConfirmPassword: false });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const startResetPassword = (staffMember) => {
    setResettingPasswordFor(staffMember._id);
    setPasswordResetForm({ newPassword: "", confirmPassword: "", showPassword: false, showConfirmPassword: false });
    setError("");
    setSuccess("");
  };

  const cancelResetPassword = () => {
    setResettingPasswordFor(null);
    setPasswordResetForm({ newPassword: "", confirmPassword: "", showPassword: false, showConfirmPassword: false });
    setError("");
  };

  const startEditStaff = (staffMember) => {
    setEditStaffForm({
      userId: staffMember._id,
      name: staffMember.name || "",
      email: staffMember.email || "",
      phone: staffMember.phone || "",
    });
    setIsEditingStaff(true);
    setError("");
    setSuccess("");
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    if (!editStaffForm.userId) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/super-admin/update-staff/${editStaffForm.userId}`,
        {
          name: editStaffForm.name,
          email: editStaffForm.email,
          phone: editStaffForm.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Staff details updated successfully!");
      setIsEditingStaff(false);
      setEditStaffForm({ userId: "", name: "", email: "", phone: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update staff details");
    } finally {
      setLoading(false);
    }
  };

  const getTeamLeaders = () => staff.filter(s => s.role === "team_leader");
  const getTeamMembers = () => staff.filter(s => s.role === "team_member");

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'dept_head': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'team_leader': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'team_member': return 'bg-green-100 text-green-800 border-green-200';
      case 'clerk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inspector': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'super_admin': return <Shield className="w-4 h-4" />;
      case 'admin': return <Settings className="w-4 h-4" />;
      case 'dept_head': return <Building className="w-4 h-4" />;
      case 'team_leader': return <Users className="w-4 h-4" />;
      case 'team_member': return <UsersRound className="w-4 h-4" />;
      case 'clerk': return <Briefcase className="w-4 h-4" />;
      case 'inspector': return <Eye className="w-4 h-4" />;
      default: return <UserCog className="w-4 h-4" />;
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = searchQuery === "" || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const tabs = [
    { id: "overview", name: "Overview", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "create-dept-head", name: "Add Dept Head", icon: <Building2 className="w-5 h-5" /> },
    { id: "create-team", name: "Create Team", icon: <UsersRound className="w-5 h-5" /> },
    { id: "add-leader", name: "Add Team Leader", icon: <Users className="w-5 h-5" /> },
    { id: "add-member", name: "Add Team Member", icon: <UserPlus className="w-5 h-5" /> },
    { id: "manage-staff", name: "Manage Staff", icon: <UserCog className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-r from-red-700 to-red-600 p-2 rounded-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Super Admin Portal</h1>
                  <p className="text-gray-600 mt-1">Manage departments, teams, and staff across the corporation</p>
                </div>
              </div>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">{stats.totalDepartments}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teams</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">{stats.totalTeams}</p>
                </div>
                <div className="bg-green-50 p-2 rounded-lg">
                  <UsersRound className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold text-purple-700 mt-1">{stats.totalStaff}</p>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Staff</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.activeStaff}</p>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Leaders</p>
                  <p className="text-2xl font-bold text-indigo-700 mt-1">{stats.teamLeaders}</p>
                </div>
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dept Heads</p>
                  <p className="text-2xl font-bold text-orange-700 mt-1">{stats.departmentHeads}</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 flex-1">{error}</p>
            <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 flex-1">{success}</p>
            <button onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-red-200 hover:bg-red-50"
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && activeTab !== "overview" && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-red-200 border-t-red-700 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === "overview" && !loading && (
            <div className="space-y-8">
              {/* Recent Teams */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <UsersRound className="w-5 h-5 text-blue-700" />
                    Recent Teams
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {teams.length} teams
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Team Name</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Department</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Leader</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Members</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {teams.slice(0, 5).map((team) => (
                        <tr key={team._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-gray-800">{team.name}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {team.department?.name || "N/A"}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">
                            {team.leader?.name || "Unassigned"}
                            {team.leader?.email && (
                              <div className="text-xs text-gray-500 mt-1">{team.leader.email}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-indigo-700">
                                  {team.members?.length || 0}
                                </span>
                              </div>
                              <span className="ml-2 text-sm text-gray-600">members</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              team.isActive !== false 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {team.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {teams.length === 0 && (
                    <div className="text-center py-12">
                      <UsersRound className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No teams created yet</p>
                    </div>
                  )}
                </div>
                {teams.length > 5 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <button
                      onClick={() => setActiveTab("manage-staff")}
                      className="text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      View all teams <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Department Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-700" />
                  Departments Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => {
                    const deptTeams = teams.filter(t => t.department?._id === dept._id);
                    const deptStaff = staff.filter(s => s.department?._id === dept._id);
                    
                    return (
                      <div key={dept._id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{dept.description || "No description"}</p>
                          </div>
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="space-y-3 mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Teams</span>
                            <span className="font-semibold text-gray-800">{deptTeams.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Staff</span>
                            <span className="font-semibold text-gray-800">{deptStaff.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Active Staff</span>
                            <span className="font-semibold text-emerald-700">
                              {deptStaff.filter(s => s.isActive).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {departments.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No departments found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Department Head */}
          {activeTab === "create-dept-head" && !loading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Create Department Head
                </h2>
                <p className="text-blue-100 text-sm mt-1">Add a new department head with administrative privileges</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleCreateDeptHead} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCog className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={deptHeadForm.name}
                          onChange={(e) => setDeptHeadForm({ ...deptHeadForm, name: e.target.value })}
                          className="pl-10 w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={deptHeadForm.email}
                          onChange={(e) => setDeptHeadForm({ ...deptHeadForm, email: e.target.value })}
                          className="pl-10 w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={deptHeadForm.phone}
                          onChange={(e) => setDeptHeadForm({ ...deptHeadForm, phone: e.target.value })}
                          className="pl-10 w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type={deptHeadForm.showPassword ? "text" : "password"}
                          value={deptHeadForm.password}
                          onChange={(e) => setDeptHeadForm({ ...deptHeadForm, password: e.target.value })}
                          className="pl-10 pr-10 w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Minimum 6 characters"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setDeptHeadForm({ ...deptHeadForm, showPassword: !deptHeadForm.showPassword })}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {deptHeadForm.showPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                          value={deptHeadForm.departmentId}
                          onChange={(e) => setDeptHeadForm({ ...deptHeadForm, departmentId: e.target.value })}
                          className="pl-10 w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          required
                        >
                          <option value="">Select a Department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Create Department Head
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Team */}
          {activeTab === "create-team" && !loading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-700 to-green-600 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <UsersRound className="w-5 h-5" />
                  Create New Team
                </h2>
                <p className="text-green-100 text-sm mt-1">Create a new team and assign a leader</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleCreateTeam} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Team Name *
                      </label>
                      <input
                        type="text"
                        value={teamForm.name}
                        onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        placeholder="Maintenance Team A"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department *
                      </label>
                      <select
                        value={teamForm.departmentId}
                        onChange={(e) => setTeamForm({ ...teamForm, departmentId: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Team Leader *
                      </label>
                      <select
                        value={teamForm.leaderId}
                        onChange={(e) => setTeamForm({ ...teamForm, leaderId: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        required
                      >
                        <option value="">Select Team Leader</option>
                        {getTeamLeaders()
                          .filter(leader => !teamForm.departmentId || leader.department?._id === teamForm.departmentId)
                          .map((leader) => (
                            <option key={leader._id} value={leader._id}>
                              {leader.name} ({leader.email}) - {leader.department?.name || "No Department"}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-semibold hover:from-green-800 hover:to-green-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Create Team
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Team Leader */}
          {activeTab === "add-leader" && !loading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-600 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Add Team Leader
                </h2>
                <p className="text-indigo-100 text-sm mt-1">Create a new team leader account</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleAddTeamLeader} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={teamLeaderForm.name}
                        onChange={(e) => setTeamLeaderForm({ ...teamLeaderForm, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Sarah Johnson"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={teamLeaderForm.email}
                        onChange={(e) => setTeamLeaderForm({ ...teamLeaderForm, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="sarah@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={teamLeaderForm.phone}
                        onChange={(e) => setTeamLeaderForm({ ...teamLeaderForm, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={teamLeaderForm.showPassword ? "text" : "password"}
                          value={teamLeaderForm.password}
                          onChange={(e) => setTeamLeaderForm({ ...teamLeaderForm, password: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          placeholder="Minimum 6 characters"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setTeamLeaderForm({ ...teamLeaderForm, showPassword: !teamLeaderForm.showPassword })}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {teamLeaderForm.showPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department *
                      </label>
                      <select
                        value={teamLeaderForm.departmentId}
                        onChange={(e) => setTeamLeaderForm({ ...teamLeaderForm, departmentId: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 bg-gradient-to-r from-indigo-700 to-indigo-600 text-white rounded-xl font-semibold hover:from-indigo-800 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Add Team Leader
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Team Member */}
          {activeTab === "add-member" && !loading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Add Team Member
                </h2>
                <p className="text-emerald-100 text-sm mt-1">Create a new team member account</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleAddTeamMember} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={teamMemberForm.name}
                        onChange={(e) => setTeamMemberForm({ ...teamMemberForm, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Alex Rodriguez"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={teamMemberForm.email}
                        onChange={(e) => setTeamMemberForm({ ...teamMemberForm, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="alex@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={teamMemberForm.phone}
                        onChange={(e) => setTeamMemberForm({ ...teamMemberForm, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={teamMemberForm.showPassword ? "text" : "password"}
                          value={teamMemberForm.password}
                          onChange={(e) => setTeamMemberForm({ ...teamMemberForm, password: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          placeholder="Minimum 6 characters"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setTeamMemberForm({ ...teamMemberForm, showPassword: !teamMemberForm.showPassword })}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {teamMemberForm.showPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department *
                      </label>
                      <select
                        value={teamMemberForm.departmentId}
                        onChange={(e) => setTeamMemberForm({ ...teamMemberForm, departmentId: e.target.value, teamId: "" })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Team (Optional)
                      </label>
                      <select
                        value={teamMemberForm.teamId}
                        onChange={(e) => setTeamMemberForm({ ...teamMemberForm, teamId: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      >
                        <option value="">No Team (Assign Later)</option>
                        {teams
                          .filter(team => !teamMemberForm.departmentId || team.department?._id === teamMemberForm.departmentId)
                          .map((team) => (
                            <option key={team._id} value={team._id}>
                              {team.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Skills (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={teamMemberForm.skills}
                        onChange={(e) => setTeamMemberForm({ ...teamMemberForm, skills: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="e.g., plumber, electrician, cleaner"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-800 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Add Team Member
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Manage Staff */}
          {activeTab === "manage-staff" && !loading && (
            <div className="space-y-8">
              {/* Move Staff Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5" />
                    Transfer Staff Member
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">Move staff between departments and teams</p>
                </div>
                <div className="p-6">
                  <form onSubmit={handleMoveStaff} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Staff Member *
                        </label>
                        <select
                          value={moveStaffForm.userId}
                          onChange={(e) => setMoveStaffForm({ ...moveStaffForm, userId: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          required
                        >
                          <option value="">Select Staff Member</option>
                          {staff.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} ({s.email}) - {s.role}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          New Department *
                        </label>
                        <select
                          value={moveStaffForm.departmentId}
                          onChange={(e) => setMoveStaffForm({ ...moveStaffForm, departmentId: e.target.value, teamId: "" })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          New Team (Optional)
                        </label>
                        <select
                          value={moveStaffForm.teamId}
                          onChange={(e) => setMoveStaffForm({ ...moveStaffForm, teamId: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="">No Team</option>
                          {teams
                            .filter(team => !moveStaffForm.departmentId || team.department?._id === moveStaffForm.departmentId)
                            .map((team) => (
                              <option key={team._id} value={team._id}>
                                {team.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Moving...
                          </>
                        ) : (
                          <>
                            <ArrowRightLeft className="w-5 h-5" />
                            Transfer Staff
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Reset Password Modal */}
              {resettingPasswordFor && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Key className="w-5 h-5 text-purple-700" />
                        Reset Password for {staff.find(s => s._id === resettingPasswordFor)?.name || "User"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Set a new password for this staff member</p>
                    </div>
                    <button
                      onClick={cancelResetPassword}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={passwordResetForm.showPassword ? "text" : "password"}
                            value={passwordResetForm.newPassword}
                            onChange={(e) => setPasswordResetForm({ ...passwordResetForm, newPassword: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setPasswordResetForm({ ...passwordResetForm, showPassword: !passwordResetForm.showPassword })}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {passwordResetForm.showPassword ? (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type={passwordResetForm.showConfirmPassword ? "text" : "password"}
                            value={passwordResetForm.confirmPassword}
                            onChange={(e) => setPasswordResetForm({ ...passwordResetForm, confirmPassword: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                            placeholder="Re-enter password"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setPasswordResetForm({ ...passwordResetForm, showConfirmPassword: !passwordResetForm.showConfirmPassword })}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {passwordResetForm.showConfirmPassword ? (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-800 hover:to-purple-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          <>
                            <Key className="w-5 h-5" />
                            Reset Password
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelResetPassword}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Staff Form */}
              {isEditingStaff && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Pencil className="w-5 h-5 text-blue-700" />
                      Edit Staff Details
                    </h3>
                    <button
                      onClick={() => {
                        setIsEditingStaff(false);
                        setEditStaffForm({ userId: "", name: "", email: "", phone: "" });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={handleEditStaff} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={editStaffForm.name}
                        onChange={(e) => setEditStaffForm({ ...editStaffForm, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editStaffForm.email}
                        onChange={(e) => setEditStaffForm({ ...editStaffForm, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={editStaffForm.phone}
                        onChange={(e) => setEditStaffForm({ ...editStaffForm, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-semibold hover:from-green-800 hover:to-green-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingStaff(false);
                          setEditStaffForm({ userId: "", name: "", email: "", phone: "" });
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Staff List with Filters */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-700" />
                        All Staff Members
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">Manage all staff accounts and permissions</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search staff..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="dept_head">Dept Head</option>
                        <option value="team_leader">Team Leader</option>
                        <option value="team_member">Team Member</option>
                        <option value="clerk">Clerk</option>
                        <option value="inspector">Inspector</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Staff Member</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Role</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Department</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Contact</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStaff.map((s) => (
                        <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                s.isActive ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                <span className="font-semibold text-gray-800">
                                  {s.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{s.name}</div>
                                <div className="text-sm text-gray-500">{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(s.role)}`}>
                              {getRoleIcon(s.role)}
                              {s.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-gray-700">{s.department?.name || "N/A"}</span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {s.email}
                              </div>
                              {s.phone && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Phone className="w-3 h-3" />
                                  {s.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              s.isActive 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {s.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              <button
                                onClick={() => startEditStaff(s)}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                              >
                                <Pencil className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => startResetPassword(s)}
                                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-1"
                              >
                                <Key className="w-3 h-3" />
                                Reset Pass
                              </button>
                              {s.isActive ? (
                                <button
                                  onClick={() => handleRemoveStaff(s._id, false)}
                                  className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors flex items-center gap-1"
                                >
                                  <EyeOff className="w-3 h-3" />
                                  Disable
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleEnableStaff(s._id)}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  Enable
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveStaff(s._id, true)}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStaff.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No staff members found</p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="mt-2 text-blue-700 hover:text-blue-800 text-sm font-medium"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Management */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <UsersRound className="w-5 h-5 text-gray-700" />
                    Manage Teams
                  </h2>
                </div>
                <div className="p-6">
                  {isEditingTeam && (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-700" />
                        Edit Team Details
                      </h3>
                      <form onSubmit={handleEditTeam} className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Team Name</label>
                          <input
                            type="text"
                            value={editTeamForm.name}
                            onChange={(e) => setEditTeamForm({ ...editTeamForm, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required
                          />
                        </div>
                        <div className="flex-1 min-w-[220px]">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Team Leader</label>
                          <select
                            value={editTeamForm.leaderId}
                            onChange={(e) => setEditTeamForm({ ...editTeamForm, leaderId: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          >
                            <option value="">Unassigned</option>
                            {staff
                              .filter(
                                (s) =>
                                  s.role === "team_leader" &&
                                  (!editTeamForm.departmentId || s.department?._id === editTeamForm.departmentId)
                              )
                              .map((leader) => (
                                <option key={leader._id} value={leader._id}>
                                  {leader.name} ({leader.email})
                                </option>
                              ))}
                          </select>
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2.5 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-semibold hover:from-green-800 hover:to-green-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingTeam(false);
                            setEditTeamForm({ teamId: "", name: "", leaderId: "", departmentId: "" });
                          }}
                          className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </form>
                    </div>
                  )}
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Team Name</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Department</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Leader</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Members</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                              <UsersRound className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p>No teams created yet</p>
                            </td>
                          </tr>
                        ) : (
                          teams.map((team) => (
                            <tr key={team._id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                              <td className="p-4">
                                <div className="font-medium text-gray-800">{team.name}</div>
                              </td>
                              <td className="p-4">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                  {team.department?.name || "N/A"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="text-gray-700">
                                  {team.leader?.name || "N/A"}
                                  {team.leader?.email && (
                                    <div className="text-xs text-gray-500 mt-1">{team.leader.email}</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-indigo-700">
                                      {team.members?.length || 0}
                                    </span>
                                  </div>
                                  <span className="ml-2 text-sm text-gray-600">members</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => startEditTeam(team)}
                                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTeam(team._id)}
                                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}