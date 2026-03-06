import { useState } from "react";

import { uploadFile, type UploadResponse } from "../services/api";

type UploadFileProps = {
  onUploadSuccess: (result: UploadResponse) => void;
};

function UploadFile({ onUploadSuccess }: UploadFileProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please choose a LAS file before uploading.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const result = await uploadFile(selectedFile);
      setUploadResult(result);
      onUploadSuccess(result);
    } catch (err) {
      setError("Upload failed. Check file format and backend status.");
      setUploadResult(null);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Upload LAS</h3>
      <input
        type="file"
        accept=".las"
        onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
      />
      <button style={{ marginLeft: 8 }} onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>

      {error && <p style={{ color: "#b42318" }}>{error}</p>}

      {uploadResult && (
        <div style={{ marginTop: 10 }}>
          <p style={{ margin: "6px 0" }}>
            Well ID: <strong>{uploadResult.well_id}</strong>
          </p>
          <p style={{ margin: "6px 0" }}>
            Curves: <strong>{uploadResult.curves.join(", ") || "None"}</strong>
          </p>
          <p style={{ margin: "6px 0" }}>
            Depth Range: <strong>{uploadResult.depth_range.min_depth}</strong> to{" "}
            <strong>{uploadResult.depth_range.max_depth}</strong>
          </p>
        </div>
      )}
    </section>
  );
}

export default UploadFile;
