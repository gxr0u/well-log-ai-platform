import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";

import { getLogs } from "../services/api";

type LogPlotProps = {
  wellId: number | null;
  curves: string[];
  depthMin?: number;
  depthMax?: number;
  fetchToken: number;
};

type PlotPayload = {
  depth: number[];
  curveData: Record<string, Array<number | null>>;
};

function LogPlot({ wellId, curves, depthMin, depthMax, fetchToken }: LogPlotProps) {
  const [payload, setPayload] = useState<PlotPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const curveData: Record<string, Array<number | null>> = {};

        for (const curve of curves) {
          const values = logs[curve];
          curveData[curve] = Array.isArray(values) ? values : [];
        }

        setPayload({ depth, curveData });
      } catch {
        setError("Failed to load log data for selected filters.");
        setPayload(null);
      } finally {
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
      type: "scatter" as const,
      mode: "lines" as const,
      name: curve,
      x: payload.curveData[curve] ?? [],
      y: payload.depth,
      line: { width: 1.2 },
    }));
  }, [curves, payload]);

  return (
    <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Well Log Plot</h3>
      {isLoading && <p>Loading logs...</p>}
      {error && <p style={{ color: "#b42318" }}>{error}</p>}
      {!isLoading && !error && traces.length === 0 && <p>Choose filters and click Plot.</p>}

      {traces.length > 0 && (
        <Plot
          data={traces}
          layout={{
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
          }}
          config={{
            responsive: true,
            scrollZoom: true,
            displaylogo: false,
          }}
          style={{ width: "100%" }}
          useResizeHandler
        />
      )}
    </section>
  );
}

export default LogPlot;
