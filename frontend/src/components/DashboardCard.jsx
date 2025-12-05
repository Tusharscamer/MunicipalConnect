export default function DashboardCard({ title, value, icon, color, trend }) {
  const colorClasses = {
    blue: "border-l-blue-500 bg-gradient-to-r from-gray-900 to-gray-800",
    green: "border-l-green-500 bg-gradient-to-r from-gray-900 to-gray-800",
    yellow: "border-l-yellow-500 bg-gradient-to-r from-gray-900 to-gray-800",
    red: "border-l-red-500 bg-gradient-to-r from-gray-900 to-gray-800",
    purple: "border-l-purple-500 bg-gradient-to-r from-gray-900 to-gray-800",
    orange: "border-l-orange-500 bg-gradient-to-r from-gray-900 to-gray-800",
    teal: "border-l-teal-500 bg-gradient-to-r from-gray-900 to-gray-800"
  };

  const iconColors = {
    blue: "text-blue-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    purple: "text-purple-400",
    orange: "text-orange-400",
    teal: "text-teal-400"
  };

  const baseColor = color?.split('-')[1] || 'blue';
  
  return (
    <div
      className={`flex items-center justify-between shadow-xl rounded-2xl p-6 border-l-4 ${
        colorClasses[baseColor] || colorClasses.blue
      } border border-gray-700 hover:transform hover:-translate-y-1 transition-all duration-300 group hover:shadow-2xl`}
    >
      <div>
        <h3 className="text-gray-400 text-sm uppercase tracking-wider font-medium">{title}</h3>
        <p className="text-3xl font-bold text-white mt-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text">
          {value}
        </p>
        {trend && (
          <p className={`text-xs mt-1 ${
            trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend}
          </p>
        )}
      </div>
      <div className={`text-4xl opacity-90 p-4 rounded-full bg-gray-800/50 group-hover:scale-110 transition-transform duration-300 ${
        iconColors[baseColor] || iconColors.blue
      }`}>
        {icon}
      </div>
    </div>
  );
}