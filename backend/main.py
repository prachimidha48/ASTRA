from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime
import uuid
import os

from database import get_db_connection, init_db
from models import (
    AstronautProfile, VitalsRecord, WellnessRecord, 
    FitnessRecord, BaselineMetric, AnomalyAlert,
    AnomalyDetectionRequest, SyncBatchRequest
)
from anomaly_detector import AstraHealthIntelligence
from data_generator import generate_telemetry_dataset

# Environment configuration
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"

app = FastAPI(
    title="ASTRA - Astronaut Health Intelligence System API",
    description="Biotelemetry processing, personalized baselines, and explainable anomaly detection for long-duration spaceflight.",
    version="2.4.0",
    # In production, disable public OpenAPI / Swagger schema discovery
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json"
)

# Explicitly trusted origins for CORS security
ALLOWED_ORIGINS = [
    origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "").split(",") if origin.strip()
] or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,  # No cookie-based sessions needed; prevent credential hijacking
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"],
)

# Security Response Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

# Global Intelligence Engine Instance
intelligence_engine = AstraHealthIntelligence(contamination=0.08)

@app.on_event("startup")
def on_startup():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM vitals")
    count = cursor.fetchone()[0]
    conn.close()
    if count == 0:
        print("No telemetry found. Seeding initial mission dataset...")
        generate_telemetry_dataset("fatigue_cascade")

@app.get("/api/health-check")
def health_check():
    return {
        "status": "ONLINE",
        "system": "ASTRA Aerospace Telemetry Node",
        "flight_software_ver": "2.4.0-ORION",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/profile", response_model=AstronautProfile)
def get_profile():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM astronaut_profile LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Astronaut profile not initialized")
    return dict(row)

@app.get("/api/vitals")
def get_vitals(
    range_view: Optional[str] = Query("7d", description="24h, 7d, 30d, all"),
    limit: Optional[int] = 100
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if range_view == "24h":
        # Return recent readings or hourly interpolated points for latest Sol
        cursor.execute("SELECT * FROM vitals ORDER BY sol DESC, timestamp DESC LIMIT 24")
    elif range_view == "7d":
        cursor.execute("SELECT * FROM vitals ORDER BY sol DESC, timestamp DESC LIMIT 7")
    elif range_view == "30d":
        cursor.execute("SELECT * FROM vitals ORDER BY sol DESC, timestamp DESC LIMIT 30")
    else:
        cursor.execute("SELECT * FROM vitals ORDER BY sol DESC, timestamp DESC LIMIT ?", (limit,))
        
    rows = cursor.fetchall()
    conn.close()
    # Return in chronological order
    data = [dict(r) for r in rows][::-1]
    return data

@app.post("/api/vitals")
def add_vitals(vital: VitalsRecord):
    conn = get_db_connection()
    cursor = conn.cursor()
    record_id = vital.id or f"VIT-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute("""
    INSERT INTO vitals (
        id, timestamp, sol, heart_rate, resting_heart_rate, spo2,
        blood_pressure_sys, blood_pressure_dia, body_temp, respiratory_rate,
        hrv, source, is_anomaly
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record_id, vital.timestamp, vital.sol, vital.heart_rate,
        vital.resting_heart_rate, vital.spo2, vital.blood_pressure_sys,
        vital.blood_pressure_dia, vital.body_temp, vital.respiratory_rate,
        vital.hrv, vital.source or "Manual Telemetry Entry", vital.is_anomaly or 0
    ))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "id": record_id}

@app.get("/api/wellness")
def get_wellness(limit: int = 30):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wellness ORDER BY sol DESC, timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows][::-1]

@app.post("/api/wellness")
def add_wellness(rec: WellnessRecord):
    conn = get_db_connection()
    cursor = conn.cursor()
    record_id = rec.id or f"WEL-{uuid.uuid4().hex[:8].upper()}"
    rem = rec.rem_sleep_duration or round(rec.sleep_duration * 0.22, 1)
    deep = rec.deep_sleep_duration or round(rec.sleep_duration * 0.24, 1)
    light = rec.light_sleep_duration or round(rec.sleep_duration - rem - deep, 1)
    
    cursor.execute("""
    INSERT INTO wellness (
        id, timestamp, sol, mood, stress_level, energy_level,
        sleep_quality, fatigue_level, sleep_duration, rem_sleep_duration,
        deep_sleep_duration, light_sleep_duration, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record_id, rec.timestamp, rec.sol, rec.mood, rec.stress_level,
        rec.energy_level, rec.sleep_quality, rec.fatigue_level,
        rec.sleep_duration, rem, deep, light, rec.notes
    ))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "id": record_id}

@app.get("/api/fitness")
def get_fitness(limit: int = 30):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM fitness ORDER BY sol DESC, timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows][::-1]

@app.post("/api/fitness")
def add_fitness(fit: FitnessRecord):
    conn = get_db_connection()
    cursor = conn.cursor()
    record_id = fit.id or f"FIT-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute("""
    INSERT INTO fitness (
        id, timestamp, sol, activity_type, duration_minutes, intensity,
        avg_heart_rate, peak_heart_rate, calories_burned, load_kg, completed, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record_id, fit.timestamp, fit.sol, fit.activity_type,
        fit.duration_minutes, fit.intensity, fit.avg_heart_rate,
        fit.peak_heart_rate, fit.calories_burned, fit.load_kg or 0,
        fit.completed or 1, fit.notes
    ))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "id": record_id}

@app.get("/api/baselines")
def get_baselines():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM baselines")
    rows = cursor.fetchall()
    conn.close()
    return {r["metric_name"]: dict(r) for r in rows}

@app.post("/api/baselines/recalculate")
def recalculate_baselines(window_days: int = 14):
    conn = get_db_connection()
    # FIX: pass ALL records; calculate_baselines now internally slices
    # to the earliest `window_days` unique sols (the calibration period)
    # so recalculating does NOT contaminate baselines with anomalous data.
    vitals_df = pd.read_sql_query("SELECT * FROM vitals ORDER BY sol ASC", conn)
    wellness_df = pd.read_sql_query("SELECT * FROM wellness ORDER BY sol ASC", conn)

    baselines = intelligence_engine.calculate_baselines(vitals_df, wellness_df, window_days)
    cursor = conn.cursor()
    for metric_name, b in baselines.items():
        cursor.execute("""
        INSERT OR REPLACE INTO baselines (
            metric_name, mean, std_dev, median, p10, p90, window_days, unit, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            b["metric_name"], b["mean"], b["std_dev"], b["median"],
            b["p10"], b["p90"], b["window_days"], b["unit"], b["updated_at"]
        ))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "baselines": baselines}

@app.get("/api/alerts")
def get_alerts():
    # First, run real-time anomaly detection to guarantee alerts reflect current data state
    conn = get_db_connection()
    vitals_df = pd.read_sql_query("SELECT * FROM vitals ORDER BY sol ASC", conn)
    wellness_df = pd.read_sql_query("SELECT * FROM wellness ORDER BY sol ASC", conn)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM baselines")
    base_rows = cursor.fetchall()
    baselines = {r["metric_name"]: dict(r) for r in base_rows}
    
    detected_alerts = intelligence_engine.detect_anomalies(vitals_df, wellness_df, baselines)
    
    # Store newly detected alerts if not existing
    for alt in detected_alerts:
        cursor.execute("SELECT id, acknowledged, dismissed FROM alerts WHERE id = ?", (alt["id"],))
        existing = cursor.fetchone()
        if not existing:
            cursor.execute("""
            INSERT INTO alerts (
                id, timestamp, sol, title, metric, baseline_value, current_value,
                severity, reason, recommended_action, acknowledged, dismissed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
            """, (
                alt["id"], alt["timestamp"], alt["sol"], alt["title"],
                alt["metric"], alt["baseline_value"], alt["current_value"],
                alt["severity"], alt["reason"], alt["recommended_action"]
            ))
        else:
            alt["acknowledged"] = bool(existing["acknowledged"])
            alt["dismissed"] = bool(existing["dismissed"])
            
    conn.commit()
    
    # Query all active alerts
    cursor.execute("SELECT * FROM alerts WHERE dismissed = 0 ORDER BY sol DESC, timestamp DESC")
    alerts_rows = cursor.fetchall()
    conn.close()
    return [dict(a) for a in alerts_rows]

@app.post("/api/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.utcnow().isoformat()
    cursor.execute("UPDATE alerts SET acknowledged = 1, ack_timestamp = ? WHERE id = ?", (now_str, alert_id))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "id": alert_id, "acknowledged": True, "ack_timestamp": now_str}

@app.post("/api/alerts/{alert_id}/dismiss")
def dismiss_alert(alert_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET dismissed = 1 WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "id": alert_id, "dismissed": True}

@app.post("/api/scenarios/reset")
def reset_scenario(scenario: str = Query("fatigue_cascade", description="fatigue_cascade, nominal, microgravity_fluid_shift, hypoxic_pocket")):
    generate_telemetry_dataset(scenario)
    # FIX: clear all previously stored alerts so stale IDs from the old
    # scenario do not persist when fresh data is loaded.
    conn = get_db_connection()
    conn.execute("DELETE FROM alerts")
    conn.commit()
    conn.close()
    # Reset Isolation Forest so it refits on the new scenario's calibration data
    global intelligence_engine
    intelligence_engine = AstraHealthIntelligence(contamination=0.08)
    return {"status": "SUCCESS", "active_scenario": scenario}

@app.post("/api/sync")
def sync_batch(batch: SyncBatchRequest):
    """Handles offline-to-online synchronization from client IndexedDB queue."""
    conn = get_db_connection()
    cursor = conn.cursor()
    v_count, w_count, f_count = 0, 0, 0
    
    for v in batch.vitals:
        v_id = v.id or f"VIT-SYNC-{uuid.uuid4().hex[:6]}"
        cursor.execute("""
        INSERT OR REPLACE INTO vitals (
            id, timestamp, sol, heart_rate, resting_heart_rate, spo2,
            blood_pressure_sys, blood_pressure_dia, body_temp, respiratory_rate,
            hrv, source, is_anomaly
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            v_id, v.timestamp, v.sol, v.heart_rate, v.resting_heart_rate,
            v.spo2, v.blood_pressure_sys, v.blood_pressure_dia, v.body_temp,
            v.respiratory_rate, v.hrv, "BioTelemetry-OfflineSync", v.is_anomaly or 0
        ))
        v_count += 1
        
    for w in batch.wellness:
        w_id = w.id or f"WEL-SYNC-{uuid.uuid4().hex[:6]}"
        cursor.execute("""
        INSERT OR REPLACE INTO wellness (
            id, timestamp, sol, mood, stress_level, energy_level,
            sleep_quality, fatigue_level, sleep_duration, rem_sleep_duration,
            deep_sleep_duration, light_sleep_duration, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            w_id, w.timestamp, w.sol, w.mood, w.stress_level, w.energy_level,
            w.sleep_quality, w.fatigue_level, w.sleep_duration,
            w.rem_sleep_duration or 0, w.deep_sleep_duration or 0, w.light_sleep_duration or 0, w.notes
        ))
        w_count += 1
        
    for f in batch.fitness:
        f_id = f.id or f"FIT-SYNC-{uuid.uuid4().hex[:6]}"
        cursor.execute("""
        INSERT OR REPLACE INTO fitness (
            id, timestamp, sol, activity_type, duration_minutes, intensity,
            avg_heart_rate, peak_heart_rate, calories_burned, load_kg, completed, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f_id, f.timestamp, f.sol, f.activity_type, f.duration_minutes,
            f.intensity, f.avg_heart_rate, f.peak_heart_rate, f.calories_burned,
            f.load_kg or 0, f.completed or 1, f.notes
        ))
        f_count += 1

    for alert_id in batch.alerts_ack:
        cursor.execute("UPDATE alerts SET acknowledged = 1 WHERE id = ?", (alert_id,))

    conn.commit()
    conn.close()
    
    return {
        "status": "SYNCED",
        "synced_vitals": v_count,
        "synced_wellness": w_count,
        "synced_fitness": f_count,
        "synced_acks": len(batch.alerts_ack),
        "timestamp": datetime.utcnow().isoformat()
    }

