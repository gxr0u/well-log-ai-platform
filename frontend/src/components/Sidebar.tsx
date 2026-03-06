import { Activity } from "lucide-react";
import { useMemo } from "react";

import type { Well } from "../services/api";
import UploadPanel from "./UploadPanel";

type SidebarProps = {
  wells: Well[];
  selectedWellId: number | null;
  availableCurves: string[];
  selectedCurves: string[];
  depthMin?: number;
  depthMax?: number;
  depthWarning?: string | null;
  onUploaded: () => void;
  onSelectWell: (wellId: number | null) => void;
  onSelectCurves: (curves: string[]) => void;
  onDepthChange: (depthMin?: number, depthMax?: number) => void;
};

function Sidebar({
  wells,
  selectedWellId,
  availableCurves,
  selectedCurves,
  depthMin,
  depthMax,
  depthWarning,
  onUploaded,
  onSelectWell,
  onSelectCurves,
  onDepthChange,
}: SidebarProps) {
  const curveCount = useMemo(() => selectedCurves.length, [selectedCurves]);

  function toggleCurve(curve: string) {
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

  function parseOptionalNumber(value: string): number | undefined {
    if (!value.trim()) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return (
    <aside className="space-y-3">
      <UploadPanel onUploaded={onUploaded} />

      <div className="panel-card space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Activity size={16} />
          Log Controls
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-300">Well</label>
          <select
            className="input-dark"
            value={selectedWellId ?? ""}
            onChange={(event) =>
              onSelectWell(
                event.target.value ? Number(event.target.value) : null,
              )
            }
          >
            <option value="">Select well...</option>
            {wells.map((well) => (
              <option key={well.id} value={well.id}>
                {well.name} (ID {well.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-1 text-xs text-slate-300">
            Curves ({curveCount} selected)
          </div>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate600 bg-slate700/40 p-2">
            {availableCurves.map((curve) => (
              <label
                key={curve}
                className="flex items-center gap-2 text-sm text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={selectedCurves.includes(curve)}
                  onChange={() => toggleCurve(curve)}
                />
                {curve}
              </label>
            ))}
            {availableCurves.length === 0 && (
              <div className="text-xs text-slate-400">No curves available.</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-slate-300">
              Depth Min
            </label>
            <input
              className="input-dark"
              type="number"
              value={depthMin ?? ""}
              onChange={(event) =>
                onDepthChange(parseOptionalNumber(event.target.value), depthMax)
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">
              Depth Max
            </label>
            <input
              className="input-dark"
              type="number"
              value={depthMax ?? ""}
              onChange={(event) =>
                onDepthChange(depthMin, parseOptionalNumber(event.target.value))
              }
            />
          </div>
        </div>

        {depthWarning && (
          <div className="rounded-lg bg-amber-300/10 p-2 text-xs text-amber-200">
            {depthWarning}
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
