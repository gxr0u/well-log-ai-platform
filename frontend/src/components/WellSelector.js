import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getWells } from "../services/api";
function WellSelector({ selectedWellId, refreshToken, onChange }) {
    const [wells, setWells] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchWells() {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getWells();
                setWells(data);
            }
            catch {
                setError("Unable to fetch wells.");
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchWells();
    }, [refreshToken]);
    return (_jsxs("section", { style: { border: "1px solid #ddd", padding: 12, borderRadius: 8 }, children: [_jsx("h3", { style: { marginTop: 0 }, children: "Select Well" }), _jsxs("select", { value: selectedWellId ?? "", onChange: (event) => onChange(event.target.value ? Number(event.target.value) : null), style: { minWidth: 260 }, children: [_jsx("option", { value: "", children: "Choose a well..." }), wells.map((well) => (_jsxs("option", { value: well.id, children: [well.name, " (ID: ", well.id, ")"] }, well.id)))] }), isLoading && _jsx("p", { children: "Loading wells..." }), error && _jsx("p", { style: { color: "#b42318" }, children: error })] }));
}
export default WellSelector;
