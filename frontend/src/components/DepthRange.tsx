type DepthRangeProps = {
  depthMin: number | undefined;
  depthMax: number | undefined;
  onChange: (range: { depthMin: number | undefined; depthMax: number | undefined }) => void;
};

function DepthRange({ depthMin, depthMax, onChange }: DepthRangeProps) {
  function toOptionalNumber(value: string): number | undefined {
    if (!value.trim()) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return (
    <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Depth Range</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label>
          Min Depth
          <input
            type="number"
            value={depthMin ?? ""}
            onChange={(event) => onChange({ depthMin: toOptionalNumber(event.target.value), depthMax })}
            style={{ display: "block" }}
          />
        </label>
        <label>
          Max Depth
          <input
            type="number"
            value={depthMax ?? ""}
            onChange={(event) => onChange({ depthMin, depthMax: toOptionalNumber(event.target.value) })}
            style={{ display: "block" }}
          />
        </label>
      </div>
    </section>
  );
}

export default DepthRange;
