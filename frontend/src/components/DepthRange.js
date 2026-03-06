import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function DepthRange({ depthMin, depthMax, onChange }) {
    function toOptionalNumber(value) {
        if (!value.trim()) {
            return undefined;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return (_jsxs("section", { style: { border: "1px solid #ddd", padding: 12, borderRadius: 8 }, children: [_jsx("h3", { style: { marginTop: 0 }, children: "Depth Range" }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [_jsxs("label", { children: ["Min Depth", _jsx("input", { type: "number", value: depthMin ?? "", onChange: (event) => onChange({ depthMin: toOptionalNumber(event.target.value), depthMax }), style: { display: "block" } })] }), _jsxs("label", { children: ["Max Depth", _jsx("input", { type: "number", value: depthMax ?? "", onChange: (event) => onChange({ depthMin, depthMax: toOptionalNumber(event.target.value) }), style: { display: "block" } })] })] })] }));
}
export default DepthRange;
