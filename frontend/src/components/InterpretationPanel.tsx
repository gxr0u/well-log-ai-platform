import { Activity } from "lucide-react";
import { useState } from "react";

import { interpretLogs, type InterpretResponse } from "../services/api";

type InterpretationPanelProps = {
  wellId: number | null;
  curves: string[];
  depthMin?: number;
  depthMax?: number;
};

function InterpretationPanel({ wellId, curves, depthMin, depthMax }: InterpretationPanelProps) {
  const [result, setResult] = useState<InterpretResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch {
      setError("Interpretation request failed.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="panel-card space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        <Activity size={16} />
        Interpretation
      </div>

      <button
        className="btn-primary w-full justify-center"
        onClick={runInterpretation}
        disabled={isLoading || !wellId || curves.length === 0}
      >
        {isLoading ? "Running..." : "Run AI Interpretation"}
      </button>

      {error && <div className="text-xs text-red-300">{error}</div>}

      {result && (
        <>
          <div className="rounded-lg border border-slate600 bg-slate700/40 p-3 text-sm text-slate-200">
            {result.summary}
          </div>
          <details className="rounded-lg border border-slate600 bg-slate700/30 p-3 text-xs text-slate-200">
            <summary className="cursor-pointer font-medium">Statistics</summary>
            <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(result.statistics, null, 2)}</pre>
          </details>
        </>
      )}
    </div>
  );
}

export default InterpretationPanel;
