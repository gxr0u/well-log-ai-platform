import axios from "axios";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000",
    timeout: 1200000,
});
export async function uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload", formData, {
        onUploadProgress: (event) => {
            if (!event.total)
                return;
            const progress = Math.round((event.loaded * 100) / event.total);
            if (onProgress)
                onProgress(progress);
        },
    });
    return response.data;
}
export async function getWells() {
    const { data } = await api.get("/wells");
    return data;
}
export async function getCurves(wellId) {
    const { data } = await api.get("/curves", {
        params: { well_id: wellId },
    });
    return Array.isArray(data) ? data : (data.curves ?? []);
}
export async function getLogs(wellId, curves, depthMin, depthMax) {
    const { data } = await api.get("/logs", {
        params: {
            well_id: wellId,
            curves,
            depth_min: depthMin,
            depth_max: depthMax,
        },
        paramsSerializer: { indexes: null },
    });
    return data;
}
export async function interpretLogs(payload) {
    const { data } = await api.post("/interpret", payload);
    return data;
}
export async function chatWithAssistant(payload) {
    const { data } = await api.post("/chat", payload);
    return data;
}
api.interceptors.response.use((response) => response, (error) => {
    console.error("API error:", error?.response?.data || error.message);
    return Promise.reject(error);
});
