import { MessageCircle } from "lucide-react";
import { FormEvent, useState } from "react";

import { chatWithAssistant } from "../services/api";

type Message = {
  role: "user" | "assistant";
  text: string;
};

type ChatPanelProps = {
  wellId: number | null;
};

function ChatPanel({ wellId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !wellId) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsSending(true);

    try {
      const result = await chatWithAssistant({ well_id: wellId, message: trimmed });
      setMessages((prev) => [...prev, { role: "assistant", text: result.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Unable to get response from chat service." },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="panel-card flex h-[360px] flex-col">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
        <MessageCircle size={16} />
        Chat Assistant
      </div>

      <div className="mb-3 flex-1 space-y-2 overflow-y-auto rounded-lg border border-slate600 bg-slate700/30 p-3">
        {messages.length === 0 && <p className="text-xs text-slate-400">Ask about trends, averages, or anomalies.</p>}
        {messages.map((message, idx) => (
          <div
            key={`${message.role}-${idx}`}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              message.role === "user"
                ? "ml-auto bg-cyan-500/20 text-cyan-100"
                : "bg-slate-600 text-slate-100"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="input-dark"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={wellId ? "Ask a well-log question..." : "Select a well first"}
          disabled={!wellId || isSending}
        />
        <button className="btn-secondary" type="submit" disabled={!wellId || isSending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
