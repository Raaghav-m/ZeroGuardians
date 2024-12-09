export interface Message {
  role: "user" | "ai";
  content: string;
  verified?: boolean;
  timestamp: string;
}
