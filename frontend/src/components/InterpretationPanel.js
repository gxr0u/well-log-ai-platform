import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Activity } from "lucide-react";
import { useState } from "react";
import { interpretLogs } from "../services/api";
function InterpretationPanel({ wellId, curves, depthMin, depthMax }) {
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    async function runInterpretation() {
        if (!wellId || curves.length === 0) {
            setError("Select a well and at least one curve.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const response = await interpretLogs({
                well_id: wellId,
                curves,
                depth_min: depthMin,
                depth_max: depthMax,
            });
            setResult(response);
        }
        catch {
            setError("Interpretation request failed.");
            setResult(null);
        }
        finally {
            setIsLoading(false);
        }
    }
    return (_jsxs("div", { className: "panel-card space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-slate-200", children: [_jsx(Activity, { size: 16 }), "Interpretation"] }), _jsx("button", { className: "btn-primary w-full justify-center", onClick: runInterpretation, disabled: isLoading || !wellId || curves.length === 0, children: isLoading ? "Running..." : "Run AI Interpretation" }), error && _jsx("div", { className: "text-xs text-red-300", children: error }), result && (_jsxs(_Fragment, { children: [_jsx("div", { className: "rounded-lg border border-slate600 bg-slate700/40 p-3 text-sm text-slate-200", children: result.summary }), _jsxs("details", { className: "rounded-lg border border-slate600 bg-slate700/30 p-3 text-xs text-slate-200", children: [_jsx("summary", { className: "cursor-pointer font-medium", children: "Statistics" }), _jsx("pre", { className: "mt-2 whitespace-pre-wrap", children: JSON.stringify(result.statistics, null, 2) })] })] }))] }));
}
export default InterpretationPanel;
