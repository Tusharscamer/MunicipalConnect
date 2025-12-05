import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import * as requestService from "../services/requestService";
import * as teamService from "../services/teamService";
import {
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Shield
} from "lucide-react";

export default function TeamMemberDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "team_member") {
      navigate("/login");
      return;
    }
    loadMyTasks();
    loadMyTeamInfo();
  }, [user]);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const res = await requestService.getRequests({ myTeamTasks: "true" });
      setRequests(res.data || []);
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to load tasks";
      setError(errorMsg);
      console.error("Load tasks error:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyTeamInfo = async () => {
    try {
      const res = await teamService.getMyTeamInfo();
      setTeamInfo(res.data?.team || null);
      if (res.data?.message && !res.data?.team) {
        console.log(res.data.message);
      }
    } catch (err) {
      console.error("Load team info error:", err);
      setError(err.response?.data?.message || "Failed to load team information");
    }
  };

  const getMyTasks = () => {
    const allTasks = [];
    const myId = user?.id || user?._id;
    requests.forEach((req) => {
      req.tasks?.forEach((task) => {
        const isAssignedToMe = task.assignedMembers?.some(
          (member) => (member._id || member) === myId
        );
        if (isAssignedToMe) {
          allTasks.push({ ...task, requestId: req._id, request: req });
        }
      });
    });
    return allTasks;
  };

  const getCurrentTasks = () => {
    return getMyTasks().filter(
      (t) => t.status !== "completed" && t.status !== "blocked"
    );
  };

  const getCompletedTasks = () => {
    return getMyTasks().filter((t) => t.status === "completed");
  };

  const handleUpdateTaskStatus = async (requestId, taskId, newStatus) => {
    try {
      await requestService.updateTask(requestId, taskId, { status: newStatus });
      loadMyTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  const currentTasks = getCurrentTasks();
  const completedTasks = getCompletedTasks();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your workspace...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Team Member Workspace</h1>
                <p className="text-gray-600 mt-1">
                  Execute assigned tasks and track your progress
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-lg border">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Active Tasks: {currentTasks.length}</span>
            </div>
            <button
              onClick={loadMyTasks}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2.5 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 px-2 py-1 bg-blue-100 rounded-full">
                ACTIVE
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{currentTasks.length}</h3>
            <p className="text-gray-600 text-sm">Current Tasks</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-xs font-semibold text-green-700 px-2 py-1 bg-green-100 rounded-full">
                DONE
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{completedTasks.length}</h3>
            <p className="text-gray-600 text-sm">Completed Tasks</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700 px-2 py-1 bg-purple-100 rounded-full">
                TEAM
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {teamInfo ? "Assigned" : "None"}
            </h3>
            <p className="text-gray-600 text-sm">Team Status</p>
          </div>
        </div>

        {/* Team Information */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">Team Information</h2>
          {teamInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Department</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {teamInfo.department?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Team Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {teamInfo.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Team Leader</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {teamInfo.leader?.name || "Unassigned"}
                    </p>
                    {teamInfo.leader?.email && (
                      <p className="text-sm text-gray-500 mt-1">{teamInfo.leader.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800">No Team Assigned</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  You are not assigned to any team yet. Please contact your Department Head.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Current Tasks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Current Tasks</h2>
              <p className="text-gray-600 text-sm mt-1">Tasks that require your attention</p>
            </div>
            <div className="text-sm text-gray-500">
              {currentTasks.length} task{currentTasks.length !== 1 ? 's' : ''} pending
            </div>
          </div>

          {currentTasks.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Tasks</h3>
              <p className="text-gray-500">All caught up! No tasks assigned at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentTasks.map((task, idx) => {
                const statusMap = {
                  todo: { label: "Not Started", color: "bg-gray-100 text-gray-800", icon: "⏱️" },
                  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: "🚀" },
                  blocked: { label: "Blocked", color: "bg-red-100 text-red-800", icon: "⚠️" },
                  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: "✅" }
                };
                const status = statusMap[task.status] || statusMap.todo;
                const isOverdue = task.deadline && new Date(task.deadline) < new Date();

                return (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                              {status.icon} {status.label}
                            </span>
                            {isOverdue && (
                              <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                          <p className="text-gray-600 text-sm mt-2">{task.description}</p>
                        </div>
                      </div>
                      
                      {/* Task Details */}
                      <div className="space-y-3 mt-5">
                        {task.request?.location?.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{task.request.location.address}</span>
                            {task.request.location.lat && task.request.location.lng && (
                              <a
                                href={`https://www.google.com/maps?q=${task.request.location.lat},${task.request.location.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline ml-auto text-xs"
                              >
                                View Map
                              </a>
                            )}
                          </div>
                        )}

                        {task.deadline && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className={`${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                              Due: {new Date(task.deadline).toLocaleDateString()}
                            </span>
                            {isOverdue && (
                              <span className="text-red-600 text-xs font-semibold ml-auto">
                                {Math.floor((new Date() - new Date(task.deadline)) / (1000 * 60 * 60 * 24))} days late
                              </span>
                            )}
                          </div>
                        )}

                        {task.estimatedTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">Estimated: {task.estimatedTime} hours</span>
                          </div>
                        )}

                        {task.instructions && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <FileText className="w-4 h-4" />
                              Instructions
                            </div>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {task.instructions}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 pt-5 border-t flex flex-col sm:flex-row gap-3">
                        {task.status === "todo" && (
                          <button
                            onClick={() => handleUpdateTaskStatus(task.requestId, task._id, "in_progress")}
                            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            Start Task
                          </button>
                        )}
                        {task.status === "in_progress" && (
                          <button
                            onClick={() => handleUpdateTaskStatus(task.requestId, task._id, "completed")}
                            className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Done
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/requests/${task.requestId}`)}
                          className="flex-1 bg-white text-gray-700 px-4 py-2.5 rounded-lg border hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Completed Tasks</h2>
              <p className="text-gray-600 text-sm mt-1">Your completed work history</p>
            </div>
            <div className="text-sm text-gray-500">
              {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} completed
            </div>
          </div>

          {completedTasks.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Completed Tasks</h3>
              <p className="text-gray-500">Your completed tasks will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {completedTasks.map((task, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-green-100 hover:shadow-sm transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                            ✅ COMPLETED
                          </span>
                          {task.completedAt && (
                            <span className="text-sm text-gray-500">
                              Completed {new Date(task.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-gray-600 text-sm mt-2">{task.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
                      {task.request?.location?.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {task.request.location.address}
                        </div>
                      )}
                      {task.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/requests/${task.requestId}`)}
                      className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      View full details
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}