import Dexie from 'dexie';

// Initialize IndexedDB database for offline-first aerospace biotelemetry
export const db = new Dexie('AstraOfflineDB');

db.version(1).stores({
  profile: 'id',
  vitals: 'id, sol, timestamp, is_anomaly',
  wellness: 'id, sol, timestamp',
  fitness: 'id, sol, timestamp, activity_type',
  baselines: 'metric_name',
  alerts: 'id, sol, timestamp, severity, acknowledged',
  syncQueue: '++id, entity, action, timestamp'
});

// Seed default initial offline dataset in case backend is offline on first launch
export async function seedInitialOfflineData() {
  const vitalsCount = await db.vitals.count();
  if (vitalsCount > 0) return;

  const baseDate = new Date(2026, 9, 15, 8, 0, 0); // Oct 15, 2026
  
  // 1. Profile
  await db.profile.put({
    id: "ASTRO-7702",
    name: "Dr. Elena Vance",
    callsign: "Valkyrie-1",
    role: "Mission Specialist / Flight Surgeon",
    mission_name: "Artemis VII - Mars Transit Simulation",
    mission_sol: 68,
    mission_duration_days: 180,
    vessel: "Deep Space Gateway / Orion HAB-4",
    craft_orbit: "Near-Rectilinear Halo Orbit (NRHO)",
    status: "Nominal Monitoring (Alert Active)",
    baseline_established: true,
    avatar_url: "./avatar.svg"
  });

  // 2. Baselines (Individual calibrated reference)
  const baselineList = [
    { metric_name: "heart_rate", unit: "BPM", mean: 68.2, std_dev: 6.5, median: 68.0, p10: 60.0, p90: 76.0, window_days: 14 },
    { metric_name: "resting_heart_rate", unit: "BPM", mean: 58.4, std_dev: 3.8, median: 58.0, p10: 53.0, p90: 63.5, window_days: 14 },
    { metric_name: "spo2", unit: "%", mean: 98.3, std_dev: 0.7, median: 98.4, p10: 97.4, p90: 99.2, window_days: 14 },
    { metric_name: "blood_pressure_sys", unit: "mmHg", mean: 116.5, std_dev: 5.2, median: 116.0, p10: 109.0, p90: 123.5, window_days: 14 },
    { metric_name: "blood_pressure_dia", unit: "mmHg", mean: 74.2, std_dev: 4.5, median: 74.0, p10: 68.0, p90: 80.0, window_days: 14 },
    { metric_name: "body_temp", unit: "°C", mean: 36.62, std_dev: 0.22, median: 36.6, p10: 36.3, p90: 36.9, window_days: 14 },
    { metric_name: "respiratory_rate", unit: "breaths/min", mean: 14.1, std_dev: 1.1, median: 14.0, p10: 12.8, p90: 15.5, window_days: 14 },
    { metric_name: "hrv", unit: "ms", mean: 58.6, std_dev: 7.8, median: 59.0, p10: 48.0, p90: 68.0, window_days: 14 },
    { metric_name: "sleep_duration", unit: "hours", mean: 7.42, std_dev: 0.72, median: 7.5, p10: 6.5, p90: 8.2, window_days: 14 }
  ];
  for (const b of baselineList) {
    await db.baselines.put({ ...b, updated_at: new Date().toISOString() });
  }

  // 3. Generate 30 Sols of telemetry (Sol 39 to 68) with realistic fatigue cascade
  const vitalsArr = [];
  const wellnessArr = [];
  const fitnessArr = [];

  for (let i = 0; i < 30; i++) {
    const sol = 39 + i;
    const solDate = new Date(baseDate);
    solDate.setDate(solDate.getDate() + i);
    const dateStr = solDate.toISOString();

    const isEscalation = i >= 22; // Sols 61 to 68
    const progress = isEscalation ? (i - 21) / 8.0 : 0.0;

    const rhr = Math.round((58.0 + progress * 14.2 + (Math.random() * 2 - 1)) * 10) / 10;
    const hr = Math.round((rhr + 10.5 + (Math.random() * 4 - 2)) * 10) / 10;
    const spo2 = Math.round(Math.min(100, Math.max(92, 98.4 - progress * 1.3 + (Math.random() * 0.6 - 0.3))) * 10) / 10;
    const bpSys = Math.round((116.0 + progress * 13.0 + (Math.random() * 4 - 2)) * 10) / 10;
    const bpDia = Math.round((74.0 + progress * 9.0 + (Math.random() * 3 - 1.5)) * 10) / 10;
    const temp = Math.round((36.6 + (isEscalation && i >= 27 ? 0.3 : 0) + (Math.random() * 0.3 - 0.15)) * 100) / 100;
    const resp = Math.round((14.0 + (isEscalation ? 1.5 : 0) + (Math.random() * 1 - 0.5)) * 10) / 10;
    const hrv = Math.round(Math.max(26, 58.0 - progress * 26.0 + (Math.random() * 4 - 2)) * 10) / 10;

    vitalsArr.push({
      id: `VIT-SOL${String(sol).padStart(3, '0')}`,
      sol,
      timestamp: dateStr,
      heart_rate: hr,
      resting_heart_rate: rhr,
      spo2,
      blood_pressure_sys: bpSys,
      blood_pressure_dia: bpDia,
      body_temp: temp,
      respiratory_rate: resp,
      hrv,
      source: "BioTelemetry-Suit-04 (SIMULATED)",
      is_anomaly: isEscalation && i >= 25 ? 1 : 0
    });

    const sleepDur = Math.round(Math.max(4.2, Math.min(9.0, 7.5 - progress * 2.6 + (Math.random() * 0.5 - 0.25))) * 10) / 10;
    const remDur = Math.round(sleepDur * 0.22 * 10) / 10;
    const deepDur = Math.round(sleepDur * 0.24 * 10) / 10;
    const lightDur = Math.round((sleepDur - remDur - deepDur) * 10) / 10;

    wellnessArr.push({
      id: `WEL-SOL${String(sol).padStart(3, '0')}`,
      sol,
      timestamp: dateStr,
      mood: isEscalation ? Math.max(3, Math.round(8 - progress * 4.2)) : 8,
      stress_level: isEscalation ? Math.min(10, Math.round(3 + progress * 5.5)) : 3,
      energy_level: isEscalation ? Math.max(2, Math.round(8 - progress * 5.0)) : 8,
      sleep_quality: isEscalation ? Math.max(2, Math.round(8 - progress * 5.2)) : 8,
      fatigue_level: isEscalation ? Math.min(10, Math.round(3 + progress * 5.8)) : 3,
      sleep_duration: sleepDur,
      rem_sleep_duration: remDur,
      deep_sleep_duration: deepDur,
      light_sleep_duration: lightDur,
      notes: isEscalation && i >= 26 
        ? "Noted persistent sleep disturbance and cognitive fatigue after docking schedule." 
        : "Standard mission cycle. Feeling nominal."
    });

    const actType = i % 3 === 0 ? "Treadmill T2 (Bungee Restraint)" : (i % 3 === 1 ? "ARED (Advanced Resistive)" : "CEVIS (Cycle Ergometer)");
    const duration = [45, 60, 75][i % 3];
    fitnessArr.push({
      id: `FIT-SOL${String(sol).padStart(3, '0')}`,
      sol,
      timestamp: dateStr,
      activity_type: actType,
      duration_minutes: duration,
      intensity: duration >= 60 ? "High" : "Moderate",
      avg_heart_rate: Math.round(135.0 + (isEscalation ? 10.0 : 0) + (Math.random() * 10 - 5)),
      peak_heart_rate: Math.round(158.0 + (isEscalation ? 8.0 : 0) + (Math.random() * 8 - 4)),
      calories_burned: Math.round(duration * 8.6),
      load_kg: actType.includes("ARED") ? 115.0 : 0.0,
      completed: 1,
      notes: "Microgravity countermeasure regimen fulfilled."
    });
  }

  await db.vitals.bulkPut(vitalsArr);
  await db.wellness.bulkPut(wellnessArr);
  await db.fitness.bulkPut(fitnessArr);
  // Note: Alerts are NOT hardcoded. They are dynamically generated from telemetry
  // records against personalized baselines in both online and offline modes.
}

