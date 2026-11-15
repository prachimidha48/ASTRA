import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "astra.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Profile table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS astronaut_profile (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        callsign TEXT,
        role TEXT NOT NULL,
        mission_name TEXT NOT NULL,
        mission_sol INTEGER NOT NULL,
        mission_duration_days INTEGER NOT NULL,
        vessel TEXT NOT NULL,
        craft_orbit TEXT NOT NULL,
        status TEXT NOT NULL,
        baseline_established BOOLEAN DEFAULT 1,
        avatar_url TEXT
    )
    """)
    
    # Vitals table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vitals (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        sol INTEGER NOT NULL,
        heart_rate REAL NOT NULL,
        resting_heart_rate REAL NOT NULL,
        spo2 REAL NOT NULL,
        blood_pressure_sys REAL NOT NULL,
        blood_pressure_dia REAL NOT NULL,
        body_temp REAL NOT NULL,
        respiratory_rate REAL NOT NULL,
        hrv REAL NOT NULL,
        source TEXT DEFAULT 'BioTelemetry-Suit-04',
        is_anomaly INTEGER DEFAULT 0
    )
    """)
    
    # Wellness & Sleep table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wellness (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        sol INTEGER NOT NULL,
        mood INTEGER NOT NULL,
        stress_level INTEGER NOT NULL,
        energy_level INTEGER NOT NULL,
        sleep_quality INTEGER NOT NULL,
        fatigue_level INTEGER NOT NULL,
        sleep_duration REAL NOT NULL,
        rem_sleep_duration REAL DEFAULT 0,
        deep_sleep_duration REAL DEFAULT 0,
        light_sleep_duration REAL DEFAULT 0,
        notes TEXT
    )
    """)
    
    # Physical Fitness table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS fitness (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        sol INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        intensity TEXT NOT NULL,
        avg_heart_rate REAL NOT NULL,
        peak_heart_rate REAL NOT NULL,
        calories_burned REAL NOT NULL,
        load_kg REAL DEFAULT 0,
        completed INTEGER DEFAULT 1,
        notes TEXT
    )
    """)
    
    # Baselines table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS baselines (
        metric_name TEXT PRIMARY KEY,
        mean REAL NOT NULL,
        std_dev REAL NOT NULL,
        median REAL NOT NULL,
        p10 REAL NOT NULL,
        p90 REAL NOT NULL,
        window_days INTEGER DEFAULT 14,
        unit TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    
    # Alerts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        sol INTEGER NOT NULL,
        title TEXT NOT NULL,
        metric TEXT NOT NULL,
        baseline_value REAL NOT NULL,
        current_value REAL NOT NULL,
        severity TEXT NOT NULL,
        reason TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        acknowledged INTEGER DEFAULT 0,
        ack_timestamp TEXT,
        dismissed INTEGER DEFAULT 0
    )
    """)
    
    # Offline sync queue
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
    )
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")

