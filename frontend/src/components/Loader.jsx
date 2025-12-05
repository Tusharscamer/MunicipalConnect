export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-700 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-b-purple-500 border-l-blue-500 rounded-full animate-spin animation-delay-500"></div>
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Loading Portal
          </p>
          <p className="text-gray-400 text-sm">Preparing your dashboard...</p>
          
          <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-loading-bar"></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}