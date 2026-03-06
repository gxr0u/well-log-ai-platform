import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { uploadFile } from "../services/api";
function UploadFile({ onUploadSuccess }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
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
        }
        catch (err) {
            setError("Upload failed. Check file format and backend status.");
            setUploadResult(null);
        }
        finally {
            setIsUploading(false);
        }
    }
    return (_jsxs("section", { style: { border: "1px solid #ddd", padding: 12, borderRadius: 8 }, children: [_jsx("h3", { style: { marginTop: 0 }, children: "Upload LAS" }), _jsx("input", { type: "file", accept: ".las", onChange: (event) => setSelectedFile(event.target.files?.[0] ?? null) }), _jsx("button", { style: { marginLeft: 8 }, onClick: handleUpload, disabled: isUploading, children: isUploading ? "Uploading..." : "Upload" }), error && _jsx("p", { style: { color: "#b42318" }, children: error }), uploadResult && (_jsxs("div", { style: { marginTop: 10 }, children: [_jsxs("p", { style: { margin: "6px 0" }, children: ["Well ID: ", _jsx("strong", { children: uploadResult.well_id })] }), _jsxs("p", { style: { margin: "6px 0" }, children: ["Curves: ", _jsx("strong", { children: uploadResult.curves.join(", ") || "None" })] }), _jsxs("p", { style: { margin: "6px 0" }, children: ["Depth Range: ", _jsx("strong", { children: uploadResult.depth_range.min_depth }), " to", " ", _jsx("strong", { children: uploadResult.depth_range.max_depth })] })] }))] }));
}
export default UploadFile;
