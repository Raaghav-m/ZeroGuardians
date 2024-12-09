import { Message } from "../ChatWindow";

interface MessageBubbleProps {
  message: Message;
  isFailed: boolean;
}

export function MessageBubble({ message, isFailed }: MessageBubbleProps) {
  return (
    <div
      className={`p-3 rounded-2xl ${
        message.role === "user"
          ? "bg-gradient-to-r from-blue-500/40 to-purple-500/40 backdrop-blur-xl text-white rounded-tr-none"
          : "bg-gray-900/40 backdrop-blur-xl text-gray-100 rounded-tl-none"
      }`}
    >
      {message.content}
      {isFailed && (
        <div className="mt-2 text-xs text-red-400">
          ⚠️ Failed - Settlement Required
        </div>
      )}
    </div>
  );
}

export function LoadingBubble() {
  return (
    <div className="bg-gray-900/40 backdrop-blur-xl p-3 rounded-2xl">
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      </div>
    </div>
  );
}
