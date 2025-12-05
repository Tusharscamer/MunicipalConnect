import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DashboardCard from "../components/DashboardCard";
import Loader from "../components/Loader";
import { TrendingUp, Users, CheckCircle, Clock, AlertTriangle, BarChart3, Download } from "lucide-react";
import axios from "axios";  // Fixed typo: was "axlos"
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [timeFilter, setTimeFilter] = useState("today");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const [statsRes, activitiesRes] = await Promise.all([
          axios.get("/api/admin/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/admin/recent-activities", {
            headers: { Authorization: `Bearer ${token}` },
            params: { period: timeFilter }
          })
        ]);
        setStats(statsRes.data);
        setRecentActivities(activitiesRes.data || []);
      } catch (err) {
        console.error("Dashboard error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [timeFilter]);

  const timeFilters = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" }
  ];

  const exportReport = () => {
    toast.success("Exporting dashboard report...");
    // Implement export functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Navbar />
        <Loader />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Monitor system performance and manage municipal services
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent text-sm focus:outline-none"
              >
                {timeFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={exportReport}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Total Requests" 
            value={stats.totalRequests || 0}
            icon={<TrendingUp />}
            color="border-l-blue-500"
            trend={stats.requestTrend || "+12%"}
          />
          
          <DashboardCard 
            title="Pending Requests" 
            value={stats.pendingRequests || 0}
            icon={<Clock />}
            color="border-l-yellow-500"
            trend={stats.pendingTrend || "+8%"}
          />
          
          <DashboardCard 
            title="Resolved Requests" 
            value={stats.resolvedRequests || 0}
            icon={<CheckCircle />}
            color="border-l-green-500"
            trend={stats.resolvedTrend || "+15%"}
          />
          
          <DashboardCard 
            title="Departments" 
            value={stats.totalDepartments || 0}
            icon={<Users />}
            color="border-l-purple-500"
          />
          
          <DashboardCard 
            title="Active Staff" 
            value={stats.activeStaff || 0}
            icon={<Users />}
            color="border-l-teal-500"
            trend={stats.staffTrend || "+5%"}
          />
          
          <DashboardCard 
            title="Avg. Response Time" 
            value={`${stats.avgResponseTime || "24"}h`}
            icon={<Clock />}
            color="border-l-orange-500"
          />
          
          <DashboardCard 
            title="SLA Compliance" 
            value={`${stats.slaCompliance || "92"}%`}
            icon={<BarChart3 />}
            color="border-l-green-500"
            trend={stats.slaTrend || "+2%"}
          />
          
          <DashboardCard 
            title="Critical Issues" 
            value={stats.criticalIssues || 0}
            icon={<AlertTriangle />}
            color="border-l-red-500"
          />
        </div>

        {/* Charts and Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Recent Activities</h2>
              <button className="text-sm text-blue-400 hover:text-blue-300">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'request' ? 'bg-blue-900/30' :
                      activity.type === 'user' ? 'bg-green-900/30' :
                      'bg-purple-900/30'
                    }`}>
                      {activity.type === 'request' ? '📝' :
                       activity.type === 'user' ? '👤' : '⚙️'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'success' ? 'bg-green-900/30 text-green-400' :
                      activity.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">Performance Metrics</h2>
            
            <div className="space-y-4">
              {[
                { label: "Citizen Satisfaction", value: "94%", color: "text-green-400", bg: "bg-green-900/20" },
                { label: "Request Resolution Rate", value: "88%", color: "text-blue-400", bg: "bg-blue-900/20" },
                { label: "First Response Time", value: "2.4h", color: "text-yellow-400", bg: "bg-yellow-900/20" },
                { label: "System Uptime", value: "99.9%", color: "text-purple-400", bg: "bg-purple-900/20" }
              ].map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{metric.label}</span>
                    <span className={`font-bold ${metric.color}`}>{metric.value}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${metric.bg}`}
                      style={{ width: `${parseInt(metric.value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="font-bold text-white mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 text-sm bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                  Manage Users
                </button>
                <button className="p-3 text-sm bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                  View Reports
                </button>
                <button className="p-3 text-sm bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                  SLA Settings
                </button>
                <button className="p-3 text-sm bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                  System Logs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Department Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(stats.departmentStats || []).map((dept, index) => (
              <div key={index} className="p-4 bg-gray-800/50 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-white">{dept.name}</h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    dept.performance > 90 ? 'bg-green-900/30 text-green-400' :
                    dept.performance > 70 ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {dept.performance}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Pending</span>
                    <span className="text-white">{dept.pending}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Resolved</span>
                    <span className="text-white">{dept.resolved}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Avg. Time</span>
                    <span className="text-white">{dept.avgTime}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}