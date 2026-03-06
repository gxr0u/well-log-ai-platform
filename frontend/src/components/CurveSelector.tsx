import { useEffect, useMemo, useState } from "react";

import { getCurves } from "../services/api";

type CurveSelectorProps = {
  wellId: number | null;
  selectedCurves: string[];
  onChange: (curves: string[]) => void;
};

function CurveSelector({ wellId, selectedCurves, onChange }: CurveSelectorProps) {
  const [availableCurves, setAvailableCurves] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurves() {
      if (!wellId) {
        setAvailableCurves([]);
        onChange([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const curves = await getCurves(wellId);
        setAvailableCurves(curves);
        const validSelected = selectedCurves.filter((curve) => curves.includes(curve));
        if (validSelected.length !== selectedCurves.length) {
          onChange(validSelected);
        }
      } catch {
        setError("Unable to fetch curves.");
        setAvailableCurves([]);
        onChange([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurves();
  }, [wellId]);

  const filteredCurves = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      return availableCurves;
    }
    return availableCurves.filter((curve) => curve.toLowerCase().includes(term));
  }, [availableCurves, searchTerm]);

  function toggleCurve(curve: string) {
    if (selectedCurves.includes(curve)) {
      onChange(selectedCurves.filter((item) => item !== curve));
      return;
    }
    onChange([...selectedCurves, curve]);
  }

  return (
    <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Select Curves</h3>
      <input
        type="text"
        placeholder="Search curves..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        style={{ width: "100%", maxWidth: 280, marginBottom: 8 }}
      />

      <div
        style={{
          maxHeight: 180,
          overflowY: "auto",
          border: "1px solid #eee",
          padding: 8,
          borderRadius: 6,
        }}
      >
        {filteredCurves.map((curve) => (
          <label key={curve} style={{ display: "block", marginBottom: 6 }}>
            <input
              type="checkbox"
              checked={selectedCurves.includes(curve)}
              onChange={() => toggleCurve(curve)}
            />{" "}
            {curve}
          </label>
        ))}
        {!isLoading && filteredCurves.length === 0 && <p style={{ margin: 0 }}>No curves found.</p>}
      </div>

      {isLoading && <p>Loading curves...</p>}
      {error && <p style={{ color: "#b42318" }}>{error}</p>}
    </section>
  );
}

export default CurveSelector;
