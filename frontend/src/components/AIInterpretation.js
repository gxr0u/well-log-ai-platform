import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { interpretLogs } from "../services/api";
function AIInterpretation({ wellId, curves, depthMin, depthMax }) {
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
            const data = await interpretLogs({
                well_id: wellId,
                curves,
                depth_min: depthMin,
                depth_max: depthMax,
            });
            setResult(data);
        }
        catch {
            setError("Failed to run AI interpretation.");
            setResult(null);
        }
        finally {
            setIsLoading(false);
        }
    }
    return (_jsxs("section", { style: { border: "1px solid #ddd", padding: 12, borderRadius: 8 }, children: [_jsx("h3", { style: { marginTop: 0 }, children: "AI Interpretation" }), _jsx("button", { onClick: runInterpretation, disabled: isLoading || !wellId || curves.length === 0, children: isLoading ? "Running..." : "Run AI Interpretation" }), error && _jsx("p", { style: { color: "#b42318" }, children: error }), result && (_jsxs("div", { style: { marginTop: 10 }, children: [_jsxs("p", { style: { margin: "6px 0" }, children: [_jsx("strong", { children: "Summary:" }), " ", result.summary] }), _jsxs("details", { children: [_jsx("summary", { children: "Statistics" }), _jsx("pre", { style: {
                                    background: "#f7f7f7",
                                    border: "1px solid #eee",
                                    padding: 8,
                                    borderRadius: 6,
                                    whiteSpace: "pre-wrap",
                                }, children: JSON.stringify(result.statistics, null, 2) })] })] }))] }));
}
export default AIInterpretation;
