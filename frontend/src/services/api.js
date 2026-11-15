import { db, seedInitialOfflineData } from './db';

const API_BASE = '/api';

// State tracker for connection mode
let isSimulatedOffline = false;
let listeners = [];

export function setSimulatedOffline(offline) {
  isSimulatedOffline = offline;
  notifyConnectionListeners();
}

export function isOffline() {
  return isSimulatedOffline || !navigator.onLine;
}

export function subscribeConnectionStatus(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(cb => cb !== callback);
  };
}

function notifyConnectionListeners() {
  const status = isOffline() ? 'OFFLINE' : 'ONLINE';
  listeners.forEach(cb => cb(status));
}

window.addEventListener('online', notifyConnectionListeners);
window.addEventListener('offline', notifyConnectionListeners);

// Helper for HTTP requests with offline fallback
async function fetchWithFallback(url, options = {}, offlineFallback) {
  if (isOffline()) {
    return await offlineFallback();
  }
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Network request to ${url} failed, falling back to local IndexedDB:`, err);
    return await offlineFallback();
  }
}

// 1. Profile
export async function getAstronautProfile() {
  await seedInitialOfflineData();
  return fetchWithFallback(
    `${API_BASE}/profile`,
    {},
    async () => {
      const p = await db.profile.toCollection().first();
      return p || {
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
        baseline_established: true
      };
    }
  );
}

// 2. Vitals
export async function getVitals(rangeView = "7d") {
  await seedInitialOfflineData();
  return fetchWithFallback(
    `${API_BASE}/vitals?range_view=${rangeView}`,
    {},
    async () => {
      let limit = 7;
      if (rangeView === '24h') limit = 24;
      if (rangeView === '30d') limit = 30;
      if (rangeView === 'all') limit = 100;
      
      const records = await db.vitals.orderBy('sol').reverse().limit(limit).toArray();
      return records.reverse();
    }
  );
}

export async function logVitals(vitalData) {
  const newRecord = {
    id: `VIT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "Manual Telemetry Entry",
    ...vitalData
  };

  // Always persist to local IndexedDB first
  await db.vitals.put(newRecord);

  if (isOffline()) {
    await db.syncQueue.put({
      entity: 'vitals',
      action: 'insert',
      payload: newRecord,
      timestamp: new Date().toISOString()
    });
    return { status: "SAVED_OFFLINE", record: newRecord };
  }

  try {
    const res = await fetch(`${API_BASE}/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    });
    return await res.json();
  } catch (err) {
    await db.syncQueue.put({
      entity: 'vitals',
      action: 'insert',
      payload: newRecord,
      timestamp: new Date().toISOString()
    });
    return { status: "SAVED_OFFLINE", record: newRecord };
  }
}

// 3. Wellness & Sleep Check-in
export async function getWellness(limit = 30) {
  await seedInitialOfflineData();
  return fetchWithFallback(
    `${API_BASE}/wellness?limit=${limit}`,
    {},
    async () => {
      const records = await db.wellness.orderBy('sol').reverse().limit(limit).toArray();
      return records.reverse();
    }
  );
}

export async function logWellnessCheckin(data) {
  const newRecord = {
    id: `WEL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    rem_sleep_duration: Math.round(data.sleep_duration * 0.22 * 10) / 10,
    deep_sleep_duration: Math.round(data.sleep_duration * 0.24 * 10) / 10,
    light_sleep_duration: Math.round((data.sleep_duration * 0.54) * 10) / 10,
    ...data
  };

  await db.wellness.put(newRecord);

  if (isOffline()) {
    await db.syncQueue.put({
      entity: 'wellness',
      action: 'insert',
      payload: newRecord,
      timestamp: new Date().toISOString()
    });
    return { status: "SAVED_OFFLINE", record: newRecord };
  }

  try {
    const res = await fetch(`${API_BASE}/wellness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    });
    return await res.json();
  } catch (err) {
    await db.syncQueue.put({
      entity: 'wellness',
      action: 'insert',
      payload: newRecord,
      timestamp: new Date().toISOString()
    });
    return { status: "SAVED_OFFLINE", record: newRecord };
  }
}

// 4. Fitness
export async function getFitness(limit = 30) {
  await seedInitialOfflineData();
  return fetchWithFallback(
    `${API_BASE}/fitness?limit=${limit}`,
    {},
    async () => {
      const records = await db.fitness.orderBy('sol').reverse().limit(limit).toArray();
      return records.reverse();
    }
  );
}

export async function logFitnessWorkout(data) {
  const newRecord = {
    id: `FIT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    completed: 1,
    ...data
  };

  await db.fitness.put(newRecord);

  if (isOffline()) {
    await db.syncQueue.put({
      entity: 'fitness',
      action: 'insert',
      payload: newRecord,
      timestamp: new Date().toISOString()
    });
    return { status: "SAVED_OFFLINE", record: newRecord };
  }

  try {
    const res = await fetch(`${API_BASE}/fitness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    });
    return await res.json();
  } catch (err) {
    await db.syncQueue.put({
      entity: 'fitness',
      action: 'insert',
      payload: newRecord,
      timestamp: new Date().toISOString()
    });
    return { status: "SAVED_OFFLINE", record: newRecord };
  }
}

// 5. Baselines
export async function getBaselines() {
  await seedInitialOfflineData();
  return fetchWithFallback(
    `${API_BASE}/baselines`,
    {},
    async () => {
      const rows = await db.baselines.toArray();
      const map = {};
      rows.forEach(r => { map[r.metric_name] = r; });
      return map;
    }
  );
}

export async function recalculateBaselines(windowDays = 14) {
  if (isOffline()) {
    // Client-side baseline recalculation using IndexedDB
    const vitals = await db.vitals.orderBy('sol').toArray();
    const wellness = await db.wellness.orderBy('sol').toArray();
    const map = {};
    
    const calculateStats = (vals) => {
      if (!vals.length) return { mean: 0, std_dev: 1, median: 0, p10: 0, p90: 0 };
      vals.sort((a, b) => a - b);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / vals.length) || 1;
      const median = vals[Math.floor(vals.length / 2)];
      const p10 = vals[Math.floor(vals.length * 0.1)];
      const p90 = vals[Math.floor(vals.length * 0.9)];
      return {
        mean: Math.round(mean * 10) / 10,
        std_dev: Math.round(std * 10) / 10,
        median: Math.round(median * 10) / 10,
        p10: Math.round(p10 * 10) / 10,
        p90: Math.round(p90 * 10) / 10
      };
    };

    // Use only the first windowDays unique sols as the calibration window (matches server-side logic)
    const calVitals = vitals.slice(0, windowDays);
    const calWellness = wellness.slice(0, windowDays);

    const hrStats = calculateStats(calVitals.map(v => v.heart_rate));
    const rhrStats = calculateStats(calVitals.map(v => v.resting_heart_rate));
    const spo2Stats = calculateStats(calVitals.map(v => v.spo2));
    const bpSysStats = calculateStats(calVitals.map(v => v.blood_pressure_sys));
    const bpDiaStats = calculateStats(calVitals.map(v => v.blood_pressure_dia));
    const tempStats = calculateStats(calVitals.map(v => v.body_temp));
    const respStats = calculateStats(calVitals.map(v => v.respiratory_rate));
    const hrvStats = calculateStats(calVitals.map(v => v.hrv));
    const sleepStats = calculateStats(calWellness.map(w => w.sleep_duration));

    const updated = {
      heart_rate: { metric_name: 'heart_rate', unit: 'BPM', ...hrStats, window_days: windowDays, updated_at: new Date().toISOString() },
      resting_heart_rate: { metric_name: 'resting_heart_rate', unit: 'BPM', ...rhrStats, window_days: windowDays, updated_at: new Date().toISOString() },
      spo2: { metric_name: 'spo2', unit: '%', ...spo2Stats, window_days: windowDays, updated_at: new Date().toISOString() },
      blood_pressure_sys: { metric_name: 'blood_pressure_sys', unit: 'mmHg', ...bpSysStats, window_days: windowDays, updated_at: new Date().toISOString() },
      blood_pressure_dia: { metric_name: 'blood_pressure_dia', unit: 'mmHg', ...bpDiaStats, window_days: windowDays, updated_at: new Date().toISOString() },
      body_temp: { metric_name: 'body_temp', unit: '°C', ...tempStats, window_days: windowDays, updated_at: new Date().toISOString() },
      respiratory_rate: { metric_name: 'respiratory_rate', unit: 'breaths/min', ...respStats, window_days: windowDays, updated_at: new Date().toISOString() },
      hrv: { metric_name: 'hrv', unit: 'ms', ...hrvStats, window_days: windowDays, updated_at: new Date().toISOString() },
      sleep_duration: { metric_name: 'sleep_duration', unit: 'hours', ...sleepStats, window_days: windowDays, updated_at: new Date().toISOString() }
    };

    for (const key in updated) {
      await db.baselines.put(updated[key]);
    }
    return { status: "SUCCESS_OFFLINE", baselines: updated };
  }

  const res = await fetch(`${API_BASE}/baselines/recalculate?window_days=${windowDays}`, { method: 'POST' });
  const data = await res.json();
  if (data.baselines) {
    for (const k in data.baselines) {
      await db.baselines.put(data.baselines[k]);
    }
  }
  return data;
}

// 6. Alerts
export async function getAlerts() {
  await seedInitialOfflineData();
  return fetchWithFallback(
    `${API_BASE}/alerts`,
    {},
    async () => {
      // Dynamic offline anomaly detection strictly derived from actual IndexedDB records
      const vitals = await db.vitals.orderBy('sol').toArray();
      if (!vitals.length) return [];
      
      const wellness = await db.wellness.orderBy('sol').toArray();
      const baseRows = await db.baselines.toArray();
      const baselines = {};
      baseRows.forEach(b => { baselines[b.metric_name] = b; });

      const lastVital = vitals[vitals.length - 1];
      const rhrBase = baselines['resting_heart_rate'] || { mean: 58.0, std_dev: 4.2 };
      const spo2Base = baselines['spo2'] || { mean: 98.2, std_dev: 0.8 };
      const bpBase = baselines['blood_pressure_sys'] || { mean: 116.0, std_dev: 5.5 };
      const hrvBase = baselines['hrv'] || { mean: 58.0, std_dev: 8.5 };
      const sleepBase = baselines['sleep_duration'] || { mean: 7.4, std_dev: 0.7 };

      const recentVitals = vitals.slice(-14);
      let consecutiveRhrElevated = 0;
      let consecutiveSleepLow = 0;

      const wellnessBySol = {};
      wellness.forEach(w => { wellnessBySol[w.sol] = w; });

      for (const row of recentVitals) {
        const wRow = wellnessBySol[row.sol];
        const sleepDur = wRow ? wRow.sleep_duration : sleepBase.mean;
        const rhrZ = (row.resting_heart_rate - rhrBase.mean) / Math.max(rhrBase.std_dev, 0.1);
        const sleepZ = (sleepDur - sleepBase.mean) / Math.max(sleepBase.std_dev, 0.1);

        if (rhrZ >= 1.5) consecutiveRhrElevated++;
        else consecutiveRhrElevated = Math.max(0, consecutiveRhrElevated - 1);

        if (sleepZ <= -1.4) consecutiveSleepLow++;
        else consecutiveSleepLow = Math.max(0, consecutiveSleepLow - 1);
      }

      const detected = [];
      const sol = lastVital.sol;
      const rhrLast = lastVital.resting_heart_rate;
      const rhrZ = (rhrLast - rhrBase.mean) / Math.max(rhrBase.std_dev, 0.1);
      const lastW = wellnessBySol[sol];
      const sleepLast = lastW ? lastW.sleep_duration : sleepBase.mean;

      // Rule 1: Compound Autonomic Strain
      if (consecutiveRhrElevated >= 2 && consecutiveSleepLow >= 2) {
        detected.push({
          id: `ALT-COMP-${sol}-${Math.round(rhrLast)}-01`,
          timestamp: lastVital.timestamp || new Date().toISOString(),
          sol: sol,
          title: "Autonomic Fatigue & Circadian Misalignment",
          metric: "Resting HR + Sleep Duration",
          baseline_value: Math.round(rhrBase.mean * 10) / 10,
          current_value: Math.round(rhrLast * 10) / 10,
          severity: rhrZ > 2.5 ? "High" : "Moderate",
          reason: `Resting heart rate has remained significantly above your personalized baseline (${rhrLast} BPM vs baseline ${rhrBase.mean} BPM, +${Math.round(rhrZ * 10) / 10}σ) concurring with reduced restorative sleep (${sleepLast}h vs ${sleepBase.mean}h) over ${consecutiveRhrElevated} consecutive mission cycles. This compound pattern indicates accumulated autonomic load, not an isolated measurement.`,
          recommended_action: "1) Schedule a 45-minute sleep extension window in quiet sleeping quarters; 2) Reduce resistive exercise load by 20% on next cycle; 3) Verify habitat acoustic dampers and circadian blue-depleted lighting; 4) Re-assess with flight surgeon telemetry check.",
          acknowledged: false,
          dismissed: false
        });
      }

      // Rule 2: SpO2 Dip
      const spo2Last = lastVital.spo2;
      const spo2Z = (spo2Last - spo2Base.mean) / Math.max(spo2Base.std_dev, 0.1);
      if (spo2Last < 94.5 || spo2Z <= -2.4) {
        detected.push({
          id: `ALT-SPO2-${sol}-${Math.round(spo2Last * 10)}-02`,
          timestamp: lastVital.timestamp || new Date().toISOString(),
          sol: sol,
          title: "Peripheral Blood Oxygen Saturation Dip",
          metric: "SpO2",
          baseline_value: Math.round(spo2Base.mean * 10) / 10,
          current_value: Math.round(spo2Last * 10) / 10,
          severity: spo2Last < 93.0 ? "High" : "Moderate",
          reason: `Recorded SpO2 of ${spo2Last}% is ${Math.round(Math.abs(spo2Z) * 10) / 10}σ below your personal baseline (${spo2Base.mean}%). In pressurized space habitats, persistent desaturation can stem from localized CO2 pockets or airway resistance.`,
          recommended_action: "1) Cross-verify ECLSS ppO2/ppCO2 cabin sensors; 2) Re-calibrate and reposition pulse oximetry optical sensor; 3) Perform forced vital capacity breathing exercise; 4) If confirmed <94%, notify Flight Surgeon immediately.",
          acknowledged: false,
          dismissed: false
        });
      }

      // Rule 3: Blood Pressure Shift
      const bpSysLast = lastVital.blood_pressure_sys;
      const bpZ = (bpSysLast - bpBase.mean) / Math.max(bpBase.std_dev, 0.1);
      if (bpSysLast >= 135.0 || bpZ >= 2.3) {
        detected.push({
          id: `ALT-BP-${sol}-${Math.round(bpSysLast)}-03`,
          timestamp: lastVital.timestamp || new Date().toISOString(),
          sol: sol,
          title: "Microgravity Cephalad Hemodynamic Shift",
          metric: "Blood Pressure (Systolic)",
          baseline_value: Math.round(bpBase.mean * 10) / 10,
          current_value: Math.round(bpSysLast * 10) / 10,
          severity: bpSysLast >= 145.0 ? "High" : "Moderate",
          reason: `Systolic blood pressure of ${bpSysLast} mmHg exceeds your personal baseline of ${bpBase.mean} mmHg by +${Math.round(bpZ * 10) / 10}σ. Microgravity cephalad fluid redistribution can induce transient central venous pressure elevation.`,
          recommended_action: "1) Hydration re-check: maintain fluid and electrolyte intake; 2) Perform 15 minutes of LBNP or light cycle ergometer session; 3) Repeat BP measurement after 30 minutes rest in seated restraint.",
          acknowledged: false,
          dismissed: false
        });
      }

      // Rule 4: Low HRV
      const hrvLast = lastVital.hrv;
      const hrvZ = (hrvLast - hrvBase.mean) / Math.max(hrvBase.std_dev, 0.1);
      if (hrvLast < 32.0 || hrvZ <= -2.0) {
        detected.push({
          id: `ALT-HRV-${sol}-${Math.round(hrvLast)}-04`,
          timestamp: lastVital.timestamp || new Date().toISOString(),
          sol: sol,
          title: "Parasympathetic Tone Withdrawal (Low HRV)",
          metric: "Heart Rate Variability (rMSSD)",
          baseline_value: Math.round(hrvBase.mean * 10) / 10,
          current_value: Math.round(hrvLast * 10) / 10,
          severity: hrvZ <= -3.0 ? "High" : "Low",
          reason: `HRV index dropped to ${hrvLast} ms vs your personalized baseline of ${hrvBase.mean} ms (${Math.round(Math.abs(hrvZ) * 10) / 10}σ below nominal). This indicates elevated sympathetic dominance, commonly linked to intense cognitive workload, pre-EVA mission prep, or incomplete autonomic recovery.`,
          recommended_action: "1) Complete guided 10-minute paced diaphragmatic resonance breathing (0.1 Hz, 6 breaths/min); 2) Check caffeine and stimulant intake timing before the sleep window; 3) Log subjective stress level in the daily wellness check-in.",
          acknowledged: false,
          dismissed: false
        });
      }

      // Reconcile with existing user acknowledgements & dismissals in IndexedDB
      for (const d of detected) {
        const existing = await db.alerts.get(d.id);
        if (existing) {
          d.acknowledged = !!existing.acknowledged;
          d.ack_timestamp = existing.ack_timestamp;
          d.dismissed = !!existing.dismissed;
        }
        await db.alerts.put(d);
      }

      return await db.alerts.filter(a => !a.dismissed).reverse().sortBy('sol');
    }
  );
}

export async function acknowledgeAlert(alertId) {
  await db.alerts.update(alertId, { acknowledged: true, ack_timestamp: new Date().toISOString() });
  
  if (isOffline()) {
    await db.syncQueue.put({
      entity: 'alert_ack',
      action: 'update',
      payload: { id: alertId },
      timestamp: new Date().toISOString()
    });
    return { status: "ACK_OFFLINE", id: alertId };
  }

  try {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    await db.syncQueue.put({
      entity: 'alert_ack',
      action: 'update',
      payload: { id: alertId },
      timestamp: new Date().toISOString()
    });
    return { status: "ACK_OFFLINE", id: alertId };
  }
}

// 7. Sync Offline Queue
export async function getPendingSyncCount() {
  return await db.syncQueue.count();
}

export async function syncPendingQueue() {
  const pending = await db.syncQueue.toArray();
  if (!pending.length) return { synced: 0, message: "Queue is empty" };

  if (isOffline()) {
    throw new Error("Cannot sync while in offline mode. Switch to Online mode first.");
  }

  const vitalsToSync = pending.filter(p => p.entity === 'vitals').map(p => p.payload);
  const wellnessToSync = pending.filter(p => p.entity === 'wellness').map(p => p.payload);
  const fitnessToSync = pending.filter(p => p.entity === 'fitness').map(p => p.payload);
  const acksToSync = pending.filter(p => p.entity === 'alert_ack').map(p => p.payload.id);

  const batchPayload = {
    vitals: vitalsToSync,
    wellness: wellnessToSync,
    fitness: fitnessToSync,
    alerts_ack: acksToSync
  };

  const res = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchPayload)
  });

  if (!res.ok) throw new Error("Sync failed on server");
  const result = await res.json();

  // Clear synced items
  await db.syncQueue.clear();
  return result;
}

// 8. Scenario Reset
export async function resetSimulationScenario(scenario = "fatigue_cascade") {
  // Clear offline tables and reseed
  await db.vitals.clear();
  await db.wellness.clear();
  await db.fitness.clear();
  await db.alerts.clear();
  await db.syncQueue.clear();

  if (!isOffline()) {
    try {
      await fetch(`${API_BASE}/scenarios/reset?scenario=${scenario}`, { method: 'POST' });
    } catch (e) {
      console.warn("Backend reset unreachable, resetting offline store", e);
    }
  }
  await seedInitialOfflineData();
  return { status: "RESET_COMPLETE", scenario };
}

