import { Upload } from "lucide-react";
import { useState } from "react";

import { type UploadResponse, uploadFile } from "../services/api";

type UploadPanelProps = {
  onUploaded: (result: UploadResponse) => void;
};

function UploadPanel({ onUploaded }: UploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null);

  async function handleUpload() {
    if (!selectedFile) {
      setError("Select a LAS file first.");
      return;
    }

    setError(null);
    setUploadProgress(0);
    setIsUploading(true);
    setIsProcessing(false);

    try {
      const result = await uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress);
        if (progress >= 100) {
          setIsUploading(false);
          setIsProcessing(true);
        }
      });
      setIsUploading(false);
      setIsProcessing(true);

      setLastUpload(result);
      onUploaded(result);
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.detail ||
        err?.message ||
        "Upload failed.";

      setError(serverMessage);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="panel-card space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        <Upload size={16} />
        Upload LAS
      </div>

      <input
        className="input-dark"
        type="file"
        accept=".las"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          setSelectedFile(file);
          setError(null);
        }}
      />

      <button
        className="btn-primary w-full justify-center"
        onClick={handleUpload}
        disabled={isUploading || isProcessing}
      >
        {isUploading ? (
          <>
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            Uploading...
          </>
        ) : (
          "Upload File"
        )}
      </button>
      {isUploading && (
        <div className="w-full bg-slate-700 rounded-lg overflow-hidden h-2">
          <div
            className="bg-accent h-2 transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {isUploading && (
        <p className="text-xs text-slate-400">Uploading {uploadProgress}%</p>
      )}
      {isProcessing && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="animate-spin h-3 w-3 border-2 border-accent border-t-transparent rounded-full"></div>
          Processing LAS file and storing log data...
        </div>
      )}

      {error && <p className="text-xs text-red-300">{error}</p>}

      {lastUpload && (
        <div className="rounded-lg border border-slate600 bg-slate700/40 p-2 text-xs text-slate-300">
          <div>Well ID: {lastUpload.well_id}</div>
          <div>
            Depth: {lastUpload.depth_range.min_depth} -{" "}
            {lastUpload.depth_range.max_depth}
          </div>
          <div>S3/Path: {lastUpload.s3_url ?? "local"}</div>
        </div>
      )}
    </div>
  );
}

export default UploadPanel;
