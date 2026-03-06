import { useEffect, useState } from "react";

import { getWells, type Well } from "../services/api";

type WellSelectorProps = {
  selectedWellId: number | null;
  refreshToken: number;
  onChange: (wellId: number | null) => void;
};

function WellSelector({ selectedWellId, refreshToken, onChange }: WellSelectorProps) {
  const [wells, setWells] = useState<Well[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWells() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getWells();
        setWells(data);
      } catch {
        setError("Unable to fetch wells.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWells();
  }, [refreshToken]);

  return (
    <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Select Well</h3>
      <select
        value={selectedWellId ?? ""}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
        style={{ minWidth: 260 }}
      >
        <option value="">Choose a well...</option>
        {wells.map((well) => (
          <option key={well.id} value={well.id}>
            {well.name} (ID: {well.id})
          </option>
        ))}
      </select>
      {isLoading && <p>Loading wells...</p>}
      {error && <p style={{ color: "#b42318" }}>{error}</p>}
    </section>
  );
}

export default WellSelector;
