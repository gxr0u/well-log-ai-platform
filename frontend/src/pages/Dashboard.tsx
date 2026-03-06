import { useEffect, useMemo, useState } from "react";

import ChatPanel from "../components/ChatPanel";
import InterpretationPanel from "../components/InterpretationPanel";
import LogViewer from "../components/LogViewer";
import Sidebar from "../components/Sidebar";
import { getCurves, getWells, type Well } from "../services/api";

function Dashboard() {
  const [wells, setWells] = useState<Well[]>([]);
  const [availableCurves, setAvailableCurves] = useState<string[]>([]);
  const [selectedWellId, setSelectedWellId] = useState<number | null>(null);
  const [selectedCurves, setSelectedCurves] = useState<string[]>([]);
  const [depthMin, setDepthMin] = useState<number | undefined>();
  const [depthMax, setDepthMax] = useState<number | undefined>();
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    async function loadWells() {
      try {
        const wells = await getWells();
        setWells(wells);
      } catch (err) {
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
        setSelectedCurves((current) =>
          current.filter((curve) => curves.includes(curve)),
        );
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

  return (
    <div className="min-h-screen bg-slate900 p-4 text-slate-100">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_1fr_360px]">
        <Sidebar
          wells={wells}
          selectedWellId={selectedWellId}
          availableCurves={availableCurves}
          selectedCurves={selectedCurves}
          depthMin={depthMin}
          depthMax={depthMax}
          depthWarning={depthWarning}
          onUploaded={() => setRefreshToken((value) => value + 1)}
          onSelectWell={setSelectedWellId}
          onSelectCurves={setSelectedCurves}
          onDepthChange={(min, max) => {
            setDepthMin(min);
            setDepthMax(max);
          }}
        />

        <main>
          <LogViewer
            wellId={selectedWellId}
            curves={selectedCurves}
            depthMin={depthMin}
            depthMax={depthMax}
          />
        </main>

        <aside className="space-y-4">
          <InterpretationPanel
            wellId={selectedWellId}
            curves={selectedCurves}
            depthMin={depthMin}
            depthMax={depthMax}
          />
          <ChatPanel wellId={selectedWellId} />
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
