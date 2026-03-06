import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Upload } from "lucide-react";
import { useState } from "react";
import { uploadFile } from "../services/api";
function UploadPanel({ onUploaded }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpload, setLastUpload] = useState(null);
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
        }
        catch (err) {
            const serverMessage = err?.response?.data?.detail ||
                err?.message ||
                "Upload failed.";
            setError(serverMessage);
        }
        finally {
            setIsUploading(false);
            setIsProcessing(false);
            setUploadProgress(0);
        }
    }
    return (_jsxs("div", { className: "panel-card space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-slate-200", children: [_jsx(Upload, { size: 16 }), "Upload LAS"] }), _jsx("input", { className: "input-dark", type: "file", accept: ".las", onChange: (event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    setError(null);
                } }), _jsx("button", { className: "btn-primary w-full justify-center", onClick: handleUpload, disabled: isUploading || isProcessing, children: isUploading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" }), "Uploading..."] })) : ("Upload File") }), isUploading && (_jsx("div", { className: "w-full bg-slate-700 rounded-lg overflow-hidden h-2", children: _jsx("div", { className: "bg-accent h-2 transition-all", style: { width: `${uploadProgress}%` } }) })), isUploading && (_jsxs("p", { className: "text-xs text-slate-400", children: ["Uploading ", uploadProgress, "%"] })), isProcessing && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-400", children: [_jsx("div", { className: "animate-spin h-3 w-3 border-2 border-accent border-t-transparent rounded-full" }), "Processing LAS file and storing log data..."] })), error && _jsx("p", { className: "text-xs text-red-300", children: error }), lastUpload && (_jsxs("div", { className: "rounded-lg border border-slate600 bg-slate700/40 p-2 text-xs text-slate-300", children: [_jsxs("div", { children: ["Well ID: ", lastUpload.well_id] }), _jsxs("div", { children: ["Depth: ", lastUpload.depth_range.min_depth, " -", " ", lastUpload.depth_range.max_depth] }), _jsxs("div", { children: ["S3/Path: ", lastUpload.s3_url ?? "local"] })] }))] }));
}
export default UploadPanel;
