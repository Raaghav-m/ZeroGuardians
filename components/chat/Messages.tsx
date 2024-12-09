import { Message } from "@/types/chat";
import { MessageBubble, LoadingBubble } from "./MessageBubble";

interface MessagesProps {
  messages: Message[];
  isLoading: boolean;
  failedMessageIndex: number | null;
}

export function Messages({
  messages,
  isLoading,
  failedMessageIndex,
}: MessagesProps) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message, index) => (
        <MessageBubble
          key={index}
          message={message}
          isFailed={index === failedMessageIndex}
        />
      ))}
      {isLoading && <LoadingBubble />}
    </div>
  );
}
