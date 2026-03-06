import { useState } from "react";

import { interpretLogs, type InterpretResponse } from "../services/api";

type AIInterpretationProps = {
  wellId: number | null;
  curves: string[];
  depthMin?: number;
  depthMax?: number;
};

function AIInterpretation({ wellId, curves, depthMin, depthMax }: AIInterpretationProps) {
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
      const data = await interpretLogs({
        well_id: wellId,
        curves,
        depth_min: depthMin,
        depth_max: depthMax,
      });
      setResult(data);
    } catch {
      setError("Failed to run AI interpretation.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>AI Interpretation</h3>
      <button onClick={runInterpretation} disabled={isLoading || !wellId || curves.length === 0}>
        {isLoading ? "Running..." : "Run AI Interpretation"}
      </button>

      {error && <p style={{ color: "#b42318" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 10 }}>
          <p style={{ margin: "6px 0" }}>
            <strong>Summary:</strong> {result.summary}
          </p>

          <details>
            <summary>Statistics</summary>
            <pre
              style={{
                background: "#f7f7f7",
                border: "1px solid #eee",
                padding: 8,
                borderRadius: 6,
                whiteSpace: "pre-wrap",
              }}
            >
              {JSON.stringify(result.statistics, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
}

export default AIInterpretation;
