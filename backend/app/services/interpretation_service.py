import os
from statistics import mean, pstdev
from typing import Any

from groq import Groq


def _safe_numeric(values: list[float | None]) -> list[float]:
    return [float(v) for v in values if v is not None]


def _trend_direction(values: list[float]) -> str:
    if len(values) < 2:
        return "flat"

    delta = values[-1] - values[0]
    if abs(delta) < 1e-9:
        return "flat"
    return "increasing" if delta > 0 else "decreasing"


def compute_statistics(log_data: dict[str, list[float | None]]) -> dict[str, dict[str, float | str | None]]:
    """Compute curve-level descriptive stats from a logs payload."""
    stats: dict[str, dict[str, float | str | None]] = {}

    for curve_name, values in log_data.items():
        if curve_name == "depth":
            continue

        numeric_values = _safe_numeric(values)
        if not numeric_values:
            stats[curve_name] = {
                "mean": None,
                "std": None,
                "min": None,
                "max": None,
                "trend": "flat",
            }
            continue

        stats[curve_name] = {
            "mean": round(mean(numeric_values), 4),
            "std": round(pstdev(numeric_values), 4) if len(numeric_values) > 1 else 0.0,
            "min": round(min(numeric_values), 4),
            "max": round(max(numeric_values), 4),
            "trend": _trend_direction(numeric_values),
        }

    return stats


def _build_interpretation_prompt(data_summary: dict[str, Any]) -> str:
    depth_min = data_summary.get("depth_min")
    depth_max = data_summary.get("depth_max")
    statistics = data_summary.get("statistics", {})

    stats_lines: list[str] = []
    for curve, curve_stats in statistics.items():
        stats_lines.append(
            (
                f"{curve}: mean={curve_stats.get('mean')}, std={curve_stats.get('std')}, "
                f"min={curve_stats.get('min')}, max={curve_stats.get('max')}, "
                f"trend={curve_stats.get('trend')}"
            )
        )

    return (
        "You are a geoscience assistant analyzing well log data. "
        "Provide a concise geological interpretation in 2-4 sentences.\n\n"
        f"Depth range: {depth_min} to {depth_max}\n"
        "Curve statistics:\n"
        + "\n".join(stats_lines)
    )


def interpret_logs_with_llm(data_summary: dict[str, Any]) -> str:
    """Send summary stats to Groq LLM and return interpretation text."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "GROQ_API_KEY is not configured. Returning statistics-only interpretation."

    prompt = _build_interpretation_prompt(data_summary)

    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    content = response.choices[0].message.content
    return content.strip() if content else "No interpretation generated."


def _detect_intents(message: str) -> list[str]:
    lowered = message.lower()
    intents: list[str] = []

    if any(token in lowered for token in ["average", "mean", "avg"]):
        intents.append("averages")
    if any(token in lowered for token in ["range", "min", "max"]):
        intents.append("ranges")
    if any(token in lowered for token in ["trend", "increase", "decrease"]):
        intents.append("trends")
    if any(token in lowered for token in ["anomaly", "outlier", "abnormal"]):
        intents.append("anomalies")

    return intents or ["general"]


def _build_chat_prompt(
    *,
    message: str,
    well_id: int,
    depth_min: float | None,
    depth_max: float | None,
    intents: list[str],
    statistics: dict[str, dict[str, float | str | None]],
) -> str:
    return (
        "You are a well log analysis assistant. "
        "Answer based only on the provided statistics and be explicit about uncertainty.\n\n"
        f"Well ID: {well_id}\n"
        f"Depth range: {depth_min} to {depth_max}\n"
        f"Detected intent(s): {', '.join(intents)}\n"
        f"User question: {message}\n\n"
        f"Available statistics: {statistics}\n"
    )


def chat_with_llm(
    *,
    message: str,
    well_id: int,
    depth_min: float | None,
    depth_max: float | None,
    log_payload: dict[str, list[float | None]],
) -> str:
    """Generate chat response with intent detection + stats context."""
    intents = _detect_intents(message)
    statistics = compute_statistics(log_payload)

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return (
            "GROQ_API_KEY is not configured. "
            f"Detected intents: {', '.join(intents)}. "
            f"Available statistics: {statistics}"
        )

    prompt = _build_chat_prompt(
        message=message,
        well_id=well_id,
        depth_min=depth_min,
        depth_max=depth_max,
        intents=intents,
        statistics=statistics,
    )

    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    content = response.choices[0].message.content
    return content.strip() if content else "No response generated."

