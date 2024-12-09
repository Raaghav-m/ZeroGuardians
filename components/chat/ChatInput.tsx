import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
}

export function ChatInput({ input, setInput, onSend }: ChatInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
    >
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow"
        />
        <Button type="submit">Send</Button>
      </div>
    </form>
  );
}
