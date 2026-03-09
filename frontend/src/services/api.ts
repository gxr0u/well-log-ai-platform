import axios from "axios";

export type Well = {
  id: number;
  name: string;
  upload_date: string;
  s3_url: string | null;
};

export type UploadResponse = {
  well_id: number;
  curves: string[];
  depth_range: {
    min_depth: number;
    max_depth: number;
  };
  s3_url?: string | null;
};

export type CurvesResponse = string[] | { curves: string[] };

export type LogsResponse = {
  depth: number[];
  [curveName: string]: Array<number | null>;
};

export type InterpretResponse = {
  summary: string;
  statistics: Record<
    string,
    {
      mean: number | null;
      std: number | null;
      min: number | null;
      max: number | null;
      trend: string;
    }
  >;
};

export type ChatResponse = {
  response: string;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://well-log-api.onrender.com",
  timeout: 1200000,
});

export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<UploadResponse>("/upload", formData, {
    onUploadProgress: (event) => {
      if (!event.total) return;
      const progress = Math.round((event.loaded * 100) / event.total);
      if (onProgress) onProgress(progress);
    },
  });

  return response.data;
}

export async function getWells(): Promise<Well[]> {
  const { data } = await api.get<Well[]>("/wells");
  return data;
}

export async function getCurves(wellId: number): Promise<string[]> {
  const { data } = await api.get<CurvesResponse>("/curves", {
    params: { well_id: wellId },
  });

  return Array.isArray(data) ? data : (data.curves ?? []);
}

export async function getLogs(
  wellId: number,
  curves: string[],
  depthMin?: number,
  depthMax?: number,
): Promise<LogsResponse> {
  const { data } = await api.get<LogsResponse>("/logs", {
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

export async function interpretLogs(payload: {
  well_id: number;
  curves: string[];
  depth_min?: number;
  depth_max?: number;
}): Promise<InterpretResponse> {
  const { data } = await api.post<InterpretResponse>("/interpret", payload);
  return data;
}

export async function chatWithAssistant(payload: {
  well_id: number;
  message: string;
  depth_min?: number;
  depth_max?: number;
}): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", payload);
  return data;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error?.response?.data || error.message);
    return Promise.reject(error);
  },
);
