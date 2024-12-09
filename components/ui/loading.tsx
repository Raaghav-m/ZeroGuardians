export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 border-4 border-blue-500/40 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xl text-blue-400 animate-pulse">Loading Models...</p>
      </div>
    </div>
  );
}
