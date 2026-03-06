import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { getCurves } from "../services/api";
function CurveSelector({ wellId, selectedCurves, onChange }) {
    const [availableCurves, setAvailableCurves] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchCurves() {
            if (!wellId) {
                setAvailableCurves([]);
                onChange([]);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const curves = await getCurves(wellId);
                setAvailableCurves(curves);
                const validSelected = selectedCurves.filter((curve) => curves.includes(curve));
                if (validSelected.length !== selectedCurves.length) {
                    onChange(validSelected);
                }
            }
            catch {
                setError("Unable to fetch curves.");
                setAvailableCurves([]);
                onChange([]);
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchCurves();
    }, [wellId]);
    const filteredCurves = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) {
            return availableCurves;
        }
        return availableCurves.filter((curve) => curve.toLowerCase().includes(term));
    }, [availableCurves, searchTerm]);
    function toggleCurve(curve) {
        if (selectedCurves.includes(curve)) {
            onChange(selectedCurves.filter((item) => item !== curve));
            return;
        }
        onChange([...selectedCurves, curve]);
    }
    return (_jsxs("section", { style: { border: "1px solid #ddd", padding: 12, borderRadius: 8 }, children: [_jsx("h3", { style: { marginTop: 0 }, children: "Select Curves" }), _jsx("input", { type: "text", placeholder: "Search curves...", value: searchTerm, onChange: (event) => setSearchTerm(event.target.value), style: { width: "100%", maxWidth: 280, marginBottom: 8 } }), _jsxs("div", { style: {
                    maxHeight: 180,
                    overflowY: "auto",
                    border: "1px solid #eee",
                    padding: 8,
                    borderRadius: 6,
                }, children: [filteredCurves.map((curve) => (_jsxs("label", { style: { display: "block", marginBottom: 6 }, children: [_jsx("input", { type: "checkbox", checked: selectedCurves.includes(curve), onChange: () => toggleCurve(curve) }), " ", curve] }, curve))), !isLoading && filteredCurves.length === 0 && _jsx("p", { style: { margin: 0 }, children: "No curves found." })] }), isLoading && _jsx("p", { children: "Loading curves..." }), error && _jsx("p", { style: { color: "#b42318" }, children: error })] }));
}
export default CurveSelector;
