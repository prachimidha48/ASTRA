import random
import uuid
from datetime import datetime, timedelta
import pandas as pd
from typing import List, Dict, Any
from database import get_db_connection, init_db

def generate_telemetry_dataset(scenario: str = "fatigue_cascade"):
    """
    Generates a 30-day realistic aerospace telemetry dataset (Sol 39 to Sol 68)
    for Dr. Elena Vance aboard Artemis VII Gateway / Mars Transit Simulation.
    
    Supported scenarios:
    - 'fatigue_cascade': Progressive circadian sleep deprivation & autonomic resting heart rate elevation.
    - 'nominal': All parameters remain strictly within baseline bounds.
    - 'microgravity_fluid_shift': Cephalad fluid redistribution causing BP elevation & mild sinus congestion.
    - 'hypoxic_pocket': Habitat localized environmental CO2/SpO2 dip.
    """
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Clear existing tables
    cursor.execute("DELETE FROM astronaut_profile")
    cursor.execute("DELETE FROM vitals")
    cursor.execute("DELETE FROM wellness")
    cursor.execute("DELETE FROM fitness")
    cursor.execute("DELETE FROM baselines")
    cursor.execute("DELETE FROM alerts")
    
    # 1. Insert Astronaut Profile
    cursor.execute("""
    INSERT INTO astronaut_profile (
        id, name, callsign, role, mission_name, mission_sol,
        mission_duration_days, vessel, craft_orbit, status, baseline_established, avatar_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "ASTRO-7702",
        "Dr. Elena Vance",
        "Valkyrie-1",
        "Mission Specialist / Flight Surgeon",
        "Artemis VII - Deep Space Transit",
        68,
        180,
        "Deep Space Gateway / Orion HAB-4",
        "Near-Rectilinear Halo Orbit (NRHO)",
        "Active Telemetry / Explainable Alert Active",
        1,
        "./avatar.svg"
    ))
    
    base_date = datetime(2026, 10, 15, 8, 0, 0)
    
    # Generate 30 days of data (Sol 39 to 68)
    vitals_records = []
    wellness_records = []
    fitness_records = []
    
    # Nominal astronaut baseline stats
    nominal_rhr = 58.0
    nominal_hr = 68.0
    nominal_spo2 = 98.4
    nominal_bp_sys = 116.0
    nominal_bp_dia = 74.0
    nominal_temp = 36.6
    nominal_resp = 14.2
    nominal_hrv = 58.0
    nominal_sleep = 7.5
    
    for day_idx in range(30):
        sol = 39 + day_idx
        sol_date = base_date + timedelta(days=day_idx)
        timestamp_str = sol_date.strftime("%Y-%m-%dT08:00:00Z")
        
        # Calculate shifts based on scenario
        is_anomaly_day = False
        rhr_drift = 0.0
        sleep_drift = 0.0
        spo2_drift = 0.0
        bp_sys_drift = 0.0
        bp_dia_drift = 0.0
        hrv_drift = 0.0
        stress_val = 3
        fatigue_val = 3
        mood_val = 8
        energy_val = 8
        
        if scenario == "fatigue_cascade":
            if day_idx >= 22: # Sols 61 to 68 (Gradual escalation)
                is_anomaly_day = True
                progress = (day_idx - 21) / 8.0 # 0.125 to 1.0
                rhr_drift = progress * 14.5 # rises from 58 up to ~72.5 BPM
                sleep_drift = -progress * 2.7 # drops from 7.5 down to ~4.8 hours
                hrv_drift = -progress * 26.0 # drops from 58 down to ~32 ms
                bp_sys_drift = progress * 13.0 # rises from 116 to ~129 mmHg
                bp_dia_drift = progress * 9.0
                spo2_drift = -progress * 1.3 # 98.4 down to ~97.1
                
                stress_val = min(10, int(3 + progress * 5.5 + random.uniform(-0.5, 0.5)))
                fatigue_val = min(10, int(3 + progress * 5.8 + random.uniform(-0.5, 0.5)))
                mood_val = max(3, int(8 - progress * 4.2 + random.uniform(-0.5, 0.5)))
                energy_val = max(2, int(8 - progress * 5.0 + random.uniform(-0.5, 0.5)))
        elif scenario == "microgravity_fluid_shift":
            if day_idx >= 24:
                is_anomaly_day = True
                bp_sys_drift = 18.0 + random.uniform(-3, 4)
                bp_dia_drift = 12.0 + random.uniform(-2, 3)
                rhr_drift = 4.0
        elif scenario == "hypoxic_pocket":
            if day_idx >= 26:
                is_anomaly_day = True
                spo2_drift = -4.2 + random.uniform(-0.5, 0.5)
                rhr_drift = 7.0
        
        # Add realistic micro-variances
        rhr = round(nominal_rhr + rhr_drift + random.uniform(-1.2, 1.2), 1)
        hr = round(rhr + 10.0 + random.uniform(-2.5, 4.0), 1)
        spo2 = round(min(100.0, max(92.0, nominal_spo2 + spo2_drift + random.uniform(-0.3, 0.3))), 1)
        bp_sys = round(nominal_bp_sys + bp_sys_drift + random.uniform(-2.5, 2.5), 1)
        bp_dia = round(nominal_bp_dia + bp_dia_drift + random.uniform(-2.0, 2.0), 1)
        temp = round(nominal_temp + random.uniform(-0.15, 0.2) + (0.3 if is_anomaly_day and day_idx >= 27 else 0.0), 2)
        resp = round(nominal_resp + (1.5 if is_anomaly_day else 0.0) + random.uniform(-0.6, 0.6), 1)
        hrv = round(max(24.0, nominal_hrv + hrv_drift + random.uniform(-2.5, 2.5)), 1)
        
        # Vitals insertion
        v_id = f"VIT-SOL{sol:03d}"
        cursor.execute("""
        INSERT INTO vitals (
            id, timestamp, sol, heart_rate, resting_heart_rate, spo2,
            blood_pressure_sys, blood_pressure_dia, body_temp, respiratory_rate,
            hrv, source, is_anomaly
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            v_id, timestamp_str, sol, hr, rhr, spo2, bp_sys, bp_dia, temp, resp, hrv,
            "BioTelemetry-Suit-04 (SIMULATED)", 1 if (is_anomaly_day and day_idx >= 25) else 0
        ))
        
        # Wellness insertion
        sleep_dur = round(max(4.2, min(9.5, nominal_sleep + sleep_drift + random.uniform(-0.3, 0.3))), 1)
        rem_dur = round(sleep_dur * 0.22, 1)
        deep_dur = round(sleep_dur * 0.24, 1)
        light_dur = round(sleep_dur - rem_dur - deep_dur, 1)
        w_id = f"WEL-SOL{sol:03d}"
        
        wellness_notes = (
            "Accumulated cognitive fatigue noted post-extravehicular inspection and docking maneuvers."
            if is_anomaly_day and day_idx >= 26 else
            "Routine orbital schedule. No subjective symptoms reported."
        )
        
        cursor.execute("""
        INSERT INTO wellness (
            id, timestamp, sol, mood, stress_level, energy_level,
            sleep_quality, fatigue_level, sleep_duration, rem_sleep_duration,
            deep_sleep_duration, light_sleep_duration, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            w_id, timestamp_str, sol, mood_val, stress_val, energy_val,
            max(2, 10 - fatigue_val), fatigue_val, sleep_dur, rem_dur, deep_dur, light_dur, wellness_notes
        ))
        
        # Fitness insertion (Aerospace exercise counters microgravity muscle atrophy & bone demineralization)
        activity_type = "Treadmill T2 (Bungee Restraint)" if day_idx % 3 == 0 else (
            "ARED (Advanced Resistive Exercise)" if day_idx % 3 == 1 else "CEVIS (Cycle Ergometer)"
        )
        duration_mins = random.choice([45, 60, 75])
        avg_act_hr = round(135.0 + random.uniform(-8, 12) + (10.0 if is_anomaly_day else 0.0), 1)
        peak_act_hr = round(avg_act_hr + random.uniform(14, 22), 1)
        cal_burn = round(duration_mins * random.uniform(7.8, 9.4), 1)
        load_kg = round(random.uniform(90, 140), 1) if "ARED" in activity_type else 0.0
        
        f_id = f"FIT-SOL{sol:03d}"
        cursor.execute("""
        INSERT INTO fitness (
            id, timestamp, sol, activity_type, duration_minutes, intensity,
            avg_heart_rate, peak_heart_rate, calories_burned, load_kg, completed, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f_id, timestamp_str, sol, activity_type, duration_mins,
            "High" if duration_mins >= 60 else "Moderate",
            avg_act_hr, peak_act_hr, cal_burn, load_kg, 1,
            "Standard countermeasure protocol completed nominal."
        ))

    # Calculate and store personalized baselines based on the first 14 days (Sol 39 to 52)
    # This represents Elena Vance's calibrated individual baseline in microgravity
    cursor.execute("""
    SELECT AVG(heart_rate) as hr_mean, AVG(resting_heart_rate) as rhr_mean,
           AVG(spo2) as spo2_mean, AVG(blood_pressure_sys) as bp_sys_mean,
           AVG(blood_pressure_dia) as bp_dia_mean, AVG(body_temp) as temp_mean,
           AVG(respiratory_rate) as resp_mean, AVG(hrv) as hrv_mean
    FROM vitals WHERE sol BETWEEN 39 AND 52
    """)
    base_row = cursor.fetchone()
    
    baseline_defs = [
        ("heart_rate", "BPM", round(base_row[0], 1), 6.5, round(base_row[0], 1), round(base_row[0]-8, 1), round(base_row[0]+8, 1)),
        ("resting_heart_rate", "BPM", round(base_row[1], 1), 3.8, round(base_row[1], 1), round(base_row[1]-5, 1), round(base_row[1]+5, 1)),
        ("spo2", "%", round(base_row[2], 1), 0.7, round(base_row[2], 1), 97.4, 99.2),
        ("blood_pressure_sys", "mmHg", round(base_row[3], 1), 5.2, round(base_row[3], 1), round(base_row[3]-7, 1), round(base_row[3]+7, 1)),
        ("blood_pressure_dia", "mmHg", round(base_row[4], 1), 4.5, round(base_row[4], 1), round(base_row[4]-6, 1), round(base_row[4]+6, 1)),
        ("body_temp", "°C", round(base_row[5], 2), 0.22, round(base_row[5], 2), 36.3, 36.9),
        ("respiratory_rate", "breaths/min", round(base_row[6], 1), 1.1, round(base_row[6], 1), 12.8, 15.6),
        ("hrv", "ms", round(base_row[7], 1), 7.8, round(base_row[7], 1), round(base_row[7]-10, 1), round(base_row[7]+10, 1)),
        ("sleep_duration", "hours", 7.4, 0.7, 7.5, 6.5, 8.2),
    ]
    
    for metric_name, unit, mean_val, std_val, median_val, p10_val, p90_val in baseline_defs:
        cursor.execute("""
        INSERT INTO baselines (
            metric_name, mean, std_dev, median, p10, p90, window_days, unit, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            metric_name, mean_val, std_val, median_val, p10_val, p90_val,
            14, unit, datetime.utcnow().isoformat()
        ))

    conn.commit()
    conn.close()
    print(f"Generated telemetry dataset successfully with scenario: {scenario}")

if __name__ == "__main__":
    generate_telemetry_dataset("fatigue_cascade")

