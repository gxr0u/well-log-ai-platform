import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import ChatPanel from "../components/ChatPanel";
import InterpretationPanel from "../components/InterpretationPanel";
import LogViewer from "../components/LogViewer";
import Sidebar from "../components/Sidebar";
import { getCurves, getWells } from "../services/api";
function Dashboard() {
    const [wells, setWells] = useState([]);
    const [availableCurves, setAvailableCurves] = useState([]);
    const [selectedWellId, setSelectedWellId] = useState(null);
    const [selectedCurves, setSelectedCurves] = useState([]);
    const [depthMin, setDepthMin] = useState();
    const [depthMax, setDepthMax] = useState();
    const [refreshToken, setRefreshToken] = useState(0);
    useEffect(() => {
        async function loadWells() {
            try {
                const wells = await getWells();
                setWells(wells);
            }
            catch (err) {
                console.error("Failed to load wells:", err);
                setWells([]);
            }
        }
        loadWells();
    }, [refreshToken]);
    useEffect(() => {
        if (!selectedWellId) {
            setAvailableCurves([]);
            setSelectedCurves([]);
            return;
        }
        getCurves(selectedWellId)
            .then((curves) => {
            setAvailableCurves(curves);
            setSelectedCurves((current) => current.filter((curve) => curves.includes(curve)));
        })
            .catch(() => {
            setAvailableCurves([]);
            setSelectedCurves([]);
        });
    }, [selectedWellId]);
    const depthWarning = useMemo(() => {
        if (depthMin === undefined || depthMax === undefined) {
            return null;
        }
        return Math.abs(depthMax - depthMin) > 500
            ? "Large depth range may slow down visualization."
            : null;
    }, [depthMin, depthMax]);
    return (_jsx("div", { className: "min-h-screen bg-slate900 p-4 text-slate-100", children: _jsxs("div", { className: "grid grid-cols-1 gap-4 xl:grid-cols-[260px_1fr_360px]", children: [_jsx(Sidebar, { wells: wells, selectedWellId: selectedWellId, availableCurves: availableCurves, selectedCurves: selectedCurves, depthMin: depthMin, depthMax: depthMax, depthWarning: depthWarning, onUploaded: () => setRefreshToken((value) => value + 1), onSelectWell: setSelectedWellId, onSelectCurves: setSelectedCurves, onDepthChange: (min, max) => {
                        setDepthMin(min);
                        setDepthMax(max);
                    } }), _jsx("main", { children: _jsx(LogViewer, { wellId: selectedWellId, curves: selectedCurves, depthMin: depthMin, depthMax: depthMax }) }), _jsxs("aside", { className: "space-y-4", children: [_jsx(InterpretationPanel, { wellId: selectedWellId, curves: selectedCurves, depthMin: depthMin, depthMax: depthMax }), _jsx(ChatPanel, { wellId: selectedWellId })] })] }) }));
}
export default Dashboard;
