from fastapi import APIRouter
from typing import Dict, Any
import random

router = APIRouter()

@router.get("/metrics", response_model=Dict[str, Any])
async def get_dashboard_metrics():
    """
    Simulates live telemetry data for the main dashboard.
    """
    # Simulate slight variations in percentages for "live" feel
    market_share = round(24.0 + random.uniform(0, 1), 1)
    sku_health = random.choice(["Optimal", "Optimal", "Good", "Warning"])
    sku_health_pct = random.randint(85, 98) if sku_health in ["Optimal", "Good"] else random.randint(60, 80)
    regional_cagr = round(12.0 + random.uniform(-0.5, 0.5), 1)
    
    # Simulate chart data fluctuations
    forge_pulse = [random.randint(40, 100) for _ in range(6)]
    competitors = [random.randint(90, 140) for _ in range(6)]

    # Fluctuate assets logic
    processing_load = random.randint(30, 85)
    ping = random.randint(8, 25)

    return {
        "marketShare": market_share,
        "marketShareTrend": f"+{round(random.uniform(1.5, 3.0), 1)}% vs last Q",
        "skuHealth": sku_health,
        "skuHealthPercentage": sku_health_pct,
        "regionalCagr": regional_cagr,
        "globalSalesPerformance": {
            "dates": ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
            "forgePulse": forge_pulse,
            "competitors": competitors,
            "peakVelocity": f"${round(random.uniform(4.0, 4.5), 1)}M"
        },
        "cognitiveIntel": {
            "anomaly": f"Competitor activity in the APAC region has surged by {random.randint(12, 18)}%. Recommend increasing orbital ad-spend by $40k.",
            "anomalyBold": f"{random.randint(12, 18)}%",
            "trend": "Projected market saturation in Sector 7-G by Q4. Shift resources to emerging EMEA clusters.",
            "summary": "\"Current trajectory suggests a breakout performance. Maintain offensive posture.\""
        },
        "penetrationMap": [
            {"city": "San Francisco", "percentage": random.randint(75, 88), "top": "30%", "left": "25%"},
            {"city": "London", "percentage": random.randint(60, 75), "top": "45%", "left": "55%"},
            {"city": "Tokyo", "percentage": random.randint(85, 95), "top": "65%", "left": "80%"}
        ],
        "assetHealth": [
            { "label": "Node Gamma",    "sub": f"Processing Load: {processing_load}%", "color": "#10b981" if processing_load < 75 else "#ffb95c", "icon": "check_circle" if processing_load < 75 else "warning" },
            { "label": "Orbital Uplink","sub": f"Ping: {ping}ms",           "color": "#10b981" if ping < 20 else "#ffb95c", "icon": "check_circle" if ping < 20 else "warning" },
            { "label": "Legacy Bridge", "sub": "Status: Throttled",    "color": "#ffb95c", "icon": "history" }
        ],
        "terminalLogs": [
            {"text": f"INITIALIZING_SYNC... [ID:{random.randint(1000, 9999)}]", "type": "info"},
            {"text": "LATENCY_NOMINAL", "type": "success"},
            {"text": f"FORGE_ENGINE_ACTIVE v2.{random.randint(0,9)}", "type": "info"}
        ]
    }
