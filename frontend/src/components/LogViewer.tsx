import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";

import { getLogs, type LogsResponse } from "../services/api";

type LogViewerProps = {
  wellId: number | null;
  curves: string[];
  depthMin?: number;
  depthMax?: number;
};

type PlotDataset = {
  depth: number[];
  curves: Record<string, Array<number | null>>;
};

const CURVE_COLORS: Record<string, string> = {
  HC1: "#22c55e",
  HC2: "#3b82f6",
  HC3: "#a855f7",
  TOTAL_GAS: "#f59e0b",
  RAW_NAPH: "#ef4444",
};

function downsampleLogs(raw: LogsResponse): PlotDataset {
  const depth = raw.depth ?? [];
  const curveNames = Object.keys(raw).filter((key) => key !== "depth");

  if (depth.length <= 2000) {
    const curveData: Record<string, Array<number | null>> = {};
    for (const curve of curveNames) {
      curveData[curve] = raw[curve] ?? [];
    }
    return { depth, curves: curveData };
  }

  const step = Math.ceil(depth.length / 2000);
  const sampledDepth = depth.filter((_, idx) => idx % step === 0);
  const sampledCurves: Record<string, Array<number | null>> = {};

  for (const curve of curveNames) {
    sampledCurves[curve] = (raw[curve] ?? []).filter((_, idx) => idx % step === 0);
  }

  return { depth: sampledDepth, curves: sampledCurves };
}

function LogViewer({ wellId, curves, depthMin, depthMax }: LogViewerProps) {
  const [logs, setLogs] = useState<PlotDataset | null>(null);
  const [depthRange, setDepthRange] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!wellId || curves.length === 0) {
        setLogs(null);
        return;
      }

      if (curves.length > 5) {
        alert("Maximum 5 curves allowed.");
        setLogs(null);
        return;
      }

      setError(null);
      setIsLoading(true);
      try {
        const response = await getLogs(wellId, curves, depthMin, depthMax);
        setLogs(downsampleLogs(response));
      } catch {
        setError("Failed to load logs.");
        setLogs(null);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [wellId, curves, depthMin, depthMax]);

  useEffect(() => {
    setDepthRange(null);
  }, [wellId, curves, depthMin, depthMax]);

  const plotData = useMemo(() => {
    if (!logs || curves.length === 0) {
      return [];
    }

    return curves.map((curve, index) => {
      const axisSuffix = index === 0 ? "" : String(index + 1);
      const trace: Record<string, unknown> = {
        type: "scatter",
        mode: "lines",
        name: curve,
        x: logs.curves[curve] ?? [],
        y: logs.depth,
        xaxis: `x${axisSuffix}`,
        yaxis: `y${axisSuffix}`,
        line: {
          width: 1.5,
          color: CURVE_COLORS[curve] ?? `hsl(${(index * 57) % 360},70%,60%)`,
        },
        hovertemplate: `${curve}<br>Value: %{x}<br>Depth: %{y}<extra></extra>`,
      };
      return trace;
    });
  }, [logs, curves]);

  const layout = useMemo(() => {
    const base: Record<string, unknown> = {
      paper_bgcolor: "#101729",
      plot_bgcolor: "#101729",
      font: { color: "#cbd5e1" },
      margin: { l: 70, r: 20, t: 30, b: 40 },
      showlegend: true,
      legend: {
        orientation: "h",
        y: -0.1,
      },
      grid: {
        rows: 1,
        columns: Math.max(curves.length, 1),
        pattern: "independent",
      },
      height: 760,
      dragmode: "pan",
      hovermode: "y",
    };

    for (let i = 0; i < curves.length; i += 1) {
      const suffix = i === 0 ? "" : String(i + 1);
      const xAxisKey = `xaxis${suffix}`;
      const yAxisKey = `yaxis${suffix}`;

      base[xAxisKey] = {
        title: {
          text: curves[i],
          font: {
            size: 12,
          },
        },
        showgrid: true,
        gridcolor: "#263250",
        zeroline: false,
        showspikes: true,
        spikemode: "across",
        spikesnap: "cursor",
        spikecolor: "#94a3b8",
        spikethickness: 1,
      };

      base[yAxisKey] = {
        autorange: depthRange ? false : "reversed",
        range: depthRange ?? undefined,
        showgrid: i === 0,
        gridcolor: "#263250",
        title: i === 0 ? "Depth" : undefined,
        matches: i === 0 ? undefined : "y",
        showticklabels: i === 0,
        showspikes: true,
        spikemode: "across",
        spikecolor: "#94a3b8",
        spikethickness: 1,
        spikesnap: "cursor",
      };
    }

    return base;
  }, [curves, depthRange]);

  return (
    <div className="panel-card h-full min-h-[760px]">
      <div className="mb-3 text-sm font-semibold text-slate-200">Multi-Track Log Viewer</div>

      {isLoading && <p className="text-sm text-slate-300">Loading logs...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {!isLoading && !error && plotData.length === 0 && (
        <p className="text-sm text-slate-400">Select a well and curves to render tracks.</p>
      )}

      {plotData.length > 0 && (
        <Plot
          data={plotData}
          layout={layout}
          onRelayout={(event: any) => {
            if (
              event["yaxis.range[0]"] !== undefined &&
              event["yaxis.range[1]"] !== undefined
            ) {
              setDepthRange([
                event["yaxis.range[0]"],
                event["yaxis.range[1]"]
              ]);
            }
          }}
          config={{
            responsive: true,
            scrollZoom: true,
            displaylogo: false,
          }}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler
        />
      )}
    </div>
  );
}

export default LogViewer;
