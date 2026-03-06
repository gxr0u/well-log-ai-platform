import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { chatWithAssistant } from "../services/api";
function ChatPanel({ wellId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    async function onSubmit(event) {
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
        }
        catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: "Unable to get response from chat service." },
            ]);
        }
        finally {
            setIsSending(false);
        }
    }
    return (_jsxs("div", { className: "panel-card flex h-[360px] flex-col", children: [_jsxs("div", { className: "mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200", children: [_jsx(MessageCircle, { size: 16 }), "Chat Assistant"] }), _jsxs("div", { className: "mb-3 flex-1 space-y-2 overflow-y-auto rounded-lg border border-slate600 bg-slate700/30 p-3", children: [messages.length === 0 && _jsx("p", { className: "text-xs text-slate-400", children: "Ask about trends, averages, or anomalies." }), messages.map((message, idx) => (_jsx("div", { className: `max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.role === "user"
                            ? "ml-auto bg-cyan-500/20 text-cyan-100"
                            : "bg-slate-600 text-slate-100"}`, children: message.text }, `${message.role}-${idx}`)))] }), _jsxs("form", { onSubmit: onSubmit, className: "flex gap-2", children: [_jsx("input", { className: "input-dark", value: input, onChange: (event) => setInput(event.target.value), placeholder: wellId ? "Ask a well-log question..." : "Select a well first", disabled: !wellId || isSending }), _jsx("button", { className: "btn-secondary", type: "submit", disabled: !wellId || isSending || !input.trim(), children: "Send" })] })] }));
}
export default ChatPanel;
