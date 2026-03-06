import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import { getLogs } from "../services/api";
function LogPlot({ wellId, curves, depthMin, depthMax, fetchToken }) {
    const [payload, setPayload] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchLogs() {
            if (!wellId || curves.length === 0 || fetchToken === 0) {
                return;
            }
            if (curves.length > 5) {
                alert("Maximum 5 curves can be plotted at once.");
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const logs = await getLogs(wellId, curves, depthMin, depthMax);
                const depth = Array.isArray(logs.depth) ? logs.depth : [];
                const curveData = {};
                for (const curve of curves) {
                    const values = logs[curve];
                    curveData[curve] = Array.isArray(values) ? values : [];
                }
                setPayload({ depth, curveData });
            }
            catch {
                setError("Failed to load log data for selected filters.");
                setPayload(null);
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchLogs();
    }, [wellId, curves, depthMin, depthMax, fetchToken]);
    const traces = useMemo(() => {
        if (!payload) {
            return [];
        }
        return curves.map((curve) => ({
            type: "scatter",
            mode: "lines",
            name: curve,
            x: payload.curveData[curve] ?? [],
            y: payload.depth,
            line: { width: 1.2 },
        }));
    }, [curves, payload]);
    return (_jsxs("section", { style: { border: "1px solid #ddd", padding: 12, borderRadius: 8 }, children: [_jsx("h3", { style: { marginTop: 0 }, children: "Well Log Plot" }), isLoading && _jsx("p", { children: "Loading logs..." }), error && _jsx("p", { style: { color: "#b42318" }, children: error }), !isLoading && !error && traces.length === 0 && _jsx("p", { children: "Choose filters and click Plot." }), traces.length > 0 && (_jsx(Plot, { data: traces, layout: {
                    title: "Curves vs Depth",
                    height: 650,
                    margin: { l: 70, r: 20, t: 45, b: 50 },
                    xaxis: {
                        title: "Curve Value",
                        automargin: true,
                    },
                    yaxis: {
                        title: "Depth",
                        autorange: "reversed",
                        automargin: true,
                    },
                    legend: {
                        orientation: "h",
                        x: 0,
                        y: 1.1,
                    },
                    dragmode: "pan",
                }, config: {
                    responsive: true,
                    scrollZoom: true,
                    displaylogo: false,
                }, style: { width: "100%" }, useResizeHandler: true }))] }));
}
export default LogPlot;
