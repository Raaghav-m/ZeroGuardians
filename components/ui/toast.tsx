import { useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function ErrorToast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-red-500/40 backdrop-blur-xl text-white px-4 py-2 rounded-xl border border-red-500/20 shadow-lg animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2">
        <span>⚠️</span>
        <p>{message}</p>
      </div>
    </div>
  );
}
