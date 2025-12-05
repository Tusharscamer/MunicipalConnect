// Add these imports at the top
import {
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  FileCheck,
  Target,
  Filter,
  RefreshCw
} from "lucide-react";

// Improved analytics section for dept head
const renderDeptHeadSection = () => (
  <section className="space-y-8">
    {/* Modern Analytics Dashboard */}
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600">Monitor department performance and trends</p>
        </div>
        <button
          onClick={() => {
            setShowAnalytics(!showAnalytics);
            if (!showAnalytics) loadAnalytics();
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 transition-all mt-4 md:mt-0"
        >
          {showAnalytics ? (
            <>
              <Filter className="w-4 h-4" />
              Hide Analytics
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              Show Analytics
            </>
          )}
        </button>
      </div>
      
      {showAnalytics && analytics && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <Target className="w-6 h-6 text-blue-700" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Total
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-gray-800">{analytics.summary.totalRequests}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-2 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-700" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  SLA
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">SLA Compliance</p>
              <p className="text-3xl font-bold text-green-700">{analytics.summary.slaComplianceRate}%</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${analytics.summary.slaComplianceRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-2 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-700" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                  Recent
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Last 7 Days</p>
              <p className="text-3xl font-bold text-orange-700">{analytics.summary.recentRequests}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <FileCheck className="w-6 h-6 text-purple-700" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                  Target
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">SLA Target</p>
              <p className="text-3xl font-bold text-purple-700">{analytics.department.slaHours}h</p>
            </div>
          </div>

          {/* Team Performance Table */}
          {analytics.teamPerformance && analytics.teamPerformance.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-700" />
                  Team Performance
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Team</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Leader</th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-600">Total</th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-600">Completed</th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-600">In Progress</th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-600">Avg Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics.teamPerformance.map((team) => (
                      <tr key={team.teamId} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{team.teamName}</td>
                        <td className="p-4 text-gray-600">{team.leaderName}</td>
                        <td className="text-center p-4">
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                            {team.totalRequests}
                          </span>
                        </td>
                        <td className="text-center p-4">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            {team.completed}
                          </span>
                        </td>
                        <td className="text-center p-4">
                          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                            {team.inProgress}
                          </span>
                        </td>
                        <td className="text-center p-4 font-semibold text-gray-700">
                          {team.avgCompletionHours}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>

    {/* Continue with improved card designs for other sections... */}
    {/* Request cards with modern design */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {deptHeadQueues.incoming.map((req) => (
        <div key={req._id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  req.priority === 'high' ? 'bg-red-500' :
                  req.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <h4 className="font-semibold text-gray-800">{req.serviceType}</h4>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{req.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              req.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {req.status.replace('_', ' ')}
            </span>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleValidate(req._id, "valid")}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all"
            >
              <CheckCircle className="inline-block w-4 h-4 mr-2" />
              Mark Valid
            </button>
            <button
              onClick={() => handleValidate(req._id, "invalid", "Marked invalid")}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all"
            >
              <AlertCircle className="inline-block w-4 h-4 mr-2" />
              Mark Invalid
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// Improved team leader section
const renderTeamLeaderSection = () => (
  <section className="space-y-8">
    {/* Modern Dashboard Header */}
    <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-6 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h3 className="text-2xl font-bold mb-2">Team Leader Command Center</h3>
          <p className="text-blue-100 opacity-90">Manage your team's tasks and monitor progress</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={loadRequests}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm text-blue-100 mb-1">Total Assigned</p>
          <p className="text-2xl font-bold">{requests.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm text-blue-100 mb-1">Pending Verification</p>
          <p className="text-2xl font-bold">
            {requests.filter((r) => r.status === "completed_on_site" || r.status === "in_review").length}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm text-blue-100 mb-1">Active Tasks</p>
          <p className="text-2xl font-bold">
            {requests.reduce((sum, r) => sum + (r.tasks?.filter((t) => t.status !== "completed").length || 0), 0)}
          </p>
        </div>
      </div>
    </div>
    
    {/* Continue with improved task management cards... */}
  </section>
);