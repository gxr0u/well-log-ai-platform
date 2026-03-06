import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Activity } from "lucide-react";
import { useMemo } from "react";
import UploadPanel from "./UploadPanel";
function Sidebar({ wells, selectedWellId, availableCurves, selectedCurves, depthMin, depthMax, depthWarning, onUploaded, onSelectWell, onSelectCurves, onDepthChange, }) {
    const curveCount = useMemo(() => selectedCurves.length, [selectedCurves]);
    function toggleCurve(curve) {
        if (selectedCurves.includes(curve)) {
            onSelectCurves(selectedCurves.filter((item) => item !== curve));
            return;
        }
        if (selectedCurves.length >= 5) {
            alert("Maximum 5 curves allowed for plotting.");
            return;
        }
        onSelectCurves([...selectedCurves, curve]);
    }
    function parseOptionalNumber(value) {
        if (!value.trim()) {
            return undefined;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return (_jsxs("aside", { className: "space-y-3", children: [_jsx(UploadPanel, { onUploaded: onUploaded }), _jsxs("div", { className: "panel-card space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-slate-200", children: [_jsx(Activity, { size: 16 }), "Log Controls"] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs text-slate-300", children: "Well" }), _jsxs("select", { className: "input-dark", value: selectedWellId ?? "", onChange: (event) => onSelectWell(event.target.value ? Number(event.target.value) : null), children: [_jsx("option", { value: "", children: "Select well..." }), wells.map((well) => (_jsxs("option", { value: well.id, children: [well.name, " (ID ", well.id, ")"] }, well.id)))] })] }), _jsxs("div", { children: [_jsxs("div", { className: "mb-1 text-xs text-slate-300", children: ["Curves (", curveCount, " selected)"] }), _jsxs("div", { className: "max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate600 bg-slate700/40 p-2", children: [availableCurves.map((curve) => (_jsxs("label", { className: "flex items-center gap-2 text-sm text-slate-200", children: [_jsx("input", { type: "checkbox", checked: selectedCurves.includes(curve), onChange: () => toggleCurve(curve) }), curve] }, curve))), availableCurves.length === 0 && (_jsx("div", { className: "text-xs text-slate-400", children: "No curves available." }))] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs text-slate-300", children: "Depth Min" }), _jsx("input", { className: "input-dark", type: "number", value: depthMin ?? "", onChange: (event) => onDepthChange(parseOptionalNumber(event.target.value), depthMax) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs text-slate-300", children: "Depth Max" }), _jsx("input", { className: "input-dark", type: "number", value: depthMax ?? "", onChange: (event) => onDepthChange(depthMin, parseOptionalNumber(event.target.value)) })] })] }), depthWarning && (_jsx("div", { className: "rounded-lg bg-amber-300/10 p-2 text-xs text-amber-200", children: depthWarning }))] })] }));
}
export default Sidebar;
