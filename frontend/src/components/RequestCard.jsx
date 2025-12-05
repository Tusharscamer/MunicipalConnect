import { useNavigate } from "react-router-dom";

export default function RequestCard({ request }) {
  const navigate = useNavigate();
  const title = request.serviceType || request.title || "Citizen Request";
  const status = request.status || "Submitted";

  const statusConfig = {
    "Resolved": { 
      bg: "bg-gradient-to-r from-green-900/30 to-green-800/20",
      text: "text-green-400",
      border: "border-green-500/30",
      icon: "✅"
    },
    "Closed": { 
      bg: "bg-gradient-to-r from-green-900/30 to-green-800/20",
      text: "text-green-400",
      border: "border-green-500/30",
      icon: "🔒"
    },
    "Submitted": { 
      bg: "bg-gradient-to-r from-yellow-900/30 to-yellow-800/20",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
      icon: "📝"
    },
    "Triage": { 
      bg: "bg-gradient-to-r from-yellow-900/30 to-yellow-800/20",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
      icon: "🔍"
    },
    "Assigned": { 
      bg: "bg-gradient-to-r from-blue-900/30 to-blue-800/20",
      text: "text-blue-400",
      border: "border-blue-500/30",
      icon: "👤"
    },
    "InProgress": { 
      bg: "bg-gradient-to-r from-purple-900/30 to-purple-800/20",
      text: "text-purple-400",
      border: "border-purple-500/30",
      icon: "⚙️"
    },
    "default": { 
      bg: "bg-gradient-to-r from-red-900/30 to-red-800/20",
      text: "text-red-400",
      border: "border-red-500/30",
      icon: "⚠️"
    }
  };

  const statusInfo = statusConfig[status] || statusConfig.default;

  return (
    <div 
      className="group bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 hover:shadow-2xl hover:border-gray-600 transition-all duration-300 hover:transform hover:-translate-y-1 cursor-pointer"
      onClick={() => navigate(`/requests/${request._id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text">
            {title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            ID: <span className="font-mono text-gray-300">{request._id?.slice(-8) || "N/A"}</span>
          </p>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.border} border`}>
          <span>{statusInfo.icon}</span>
          <span className={`text-xs font-semibold ${statusInfo.text}`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      <p className="text-gray-300 line-clamp-2 mb-6 leading-relaxed">
        {request.description || "No description provided"}
      </p>

      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(request.createdAt || Date.now()).toLocaleDateString()}
          </div>
          
          {request.category && (
            <div className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-medium">
              {request.category}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/requests/${request._id}`);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 hover:text-white hover:from-gray-700 hover:to-gray-800 transition-all group border border-gray-700 hover:border-gray-600"
        >
          <span className="font-medium">View Details</span>
          <svg 
            className="w-4 h-4 transform transition-transform group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}