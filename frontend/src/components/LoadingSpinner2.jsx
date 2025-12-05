export default function LoadingSpinner2() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-4 h-4 bg-blue-700 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
      <p className="mt-4 text-gray-600 font-medium">Loading content...</p>
    </div>
  );
}
