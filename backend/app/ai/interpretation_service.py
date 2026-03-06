import os
from typing import Any

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from groq import Groq
from sklearn.ensemble import IsolationForest

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# -----------------------------
# 1. Compute statistics
# -----------------------------
def compute_statistics(log_payload: dict[str, list[float | None]]) -> dict[str, Any]:
    """Compute mean, std, and trend for each curve."""
    curve_names = [k for k in log_payload.keys() if k != "depth"]

    frame_data = {curve: pd.to_numeric(log_payload[curve], errors="coerce") for curve in curve_names}
    df = pd.DataFrame(frame_data)

    statistics: dict[str, dict[str, float | str | None]] = {}

    for curve in curve_names:
        series = df[curve].dropna()

        if series.empty:
            statistics[curve] = {"mean": None, "std": None, "trend": "flat"}
            continue

        slope = np.polyfit(np.arange(len(series)), series.values, 1)[0] if len(series) > 1 else 0
        trend = "increasing" if slope > 0 else "decreasing" if slope < 0 else "flat"

        statistics[curve] = {
            "mean": round(float(series.mean()), 4),
            "std": round(float(series.std(ddof=0)), 4),
            "trend": trend,
        }

    return statistics


# -----------------------------
# 2. LLM Interpretation
# -----------------------------
def interpret_logs_with_llm(context: dict) -> str:
    """Send statistics to Groq LLM and get interpretation."""

    prompt = f"""
You are a geoscience assistant analyzing well log data.

Well ID: {context['well_id']}
Depth range: {context['depth_min']} to {context['depth_max']}

Curve statistics:
{context['statistics']}

Provide a short geological interpretation of what these log patterns might indicate.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content


# -----------------------------
# 3. Chat assistant
# -----------------------------
def chat_with_llm(
    message: str,
    well_id: int,
    depth_min: float | None,
    depth_max: float | None,
    log_payload: dict,
) -> str:

    statistics = compute_statistics(log_payload)

    # Provide example values for context
    sample_data = {}
    for curve, values in log_payload.items():
        if curve == "depth":
            continue
        sample_data[curve] = values[:5]

    prompt = f"""
You are a geoscience assistant analyzing well log data.

Well ID: {well_id}
Depth range analyzed: {depth_min} to {depth_max} ft

Statistics for the selected interval:
{statistics}

Example data samples from this interval:
{sample_data}

User question:
{message}

Answer using the provided statistics and data samples.
Explain trends clearly and relate them to possible geological interpretation.
Keep the response concise (3–5 sentences).
"""

    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content