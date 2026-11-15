import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  Info,
  Server,
  User,
  Sliders,
  HardDrive
} from 'lucide-react';
import { 
  getPendingSyncCount, 
  syncPendingQueue, 
  resetSimulationScenario, 
  recalculateBaselines,
  isOffline,
  setSimulatedOffline
} from '../services/api';
import { db } from '../services/db';

export default function Settings({ 
  profile, 
  baselines, 
  connectionStatus, 
  onRefreshData 
}) {
  const [pendingCount, setPendingCount] = useState(0);
  const [dbStats, setDbStats] = useState({ vitals: 0, wellness: 0, fitness: 0, alerts: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('fatigue_cascade');

  const updateCounts = async () => {
    try {
      const p = await getPendingSyncCount();
      setPendingCount(p);
      const v = await db.vitals.count();
      const w = await db.wellness.count();
      const f = await db.fitness.count();
      const a = await db.alerts.count();
      setDbStats({ vitals: v, wellness: w, fitness: f, alerts: a });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    updateCounts();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncPendingQueue();
      setFeedback(`Ground sync completed: ${res.synced_vitals || 0} vitals, ${res.synced_wellness || 0} wellness items synced.`);
      await updateCounts();
      onRefreshData();
      setTimeout(() => setFeedback(''), 3500);
    } catch (err) {
      setFeedback(`Sync failed: ${err.message}`);
      setTimeout(() => setFeedback(''), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Reset all telemetry and reseed simulation scenario?")) return;
    setIsResetting(true);
    try {
      await resetSimulationScenario(selectedScenario);
      setFeedback(`Telemetry successfully reset with scenario: "${selectedScenario}".`);
      await updateCounts();
      onRefreshData();
      setTimeout(() => setFeedback(''), 3500);
    } catch (e) {
      setFeedback(`Reset failed: ${e.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const toggleConnection = () => {
    const currentlyOffline = isOffline();
    setSimulatedOffline(!currentlyOffline);
    setFeedback(`Switched to: ${!currentlyOffline ? 'SIMULATED OFFLINE (IndexedDB Only)' : 'ONLINE (Ground Link)'}`);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-fadeIn font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-sky-600" />
          SYSTEM CONFIGURATION & OFFLINE ENGINE
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage local IndexedDB storage, ground sync queues, mission telemetry parameters, and demo scenarios
        </p>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center gap-2 font-mono animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. Astronaut & Mission Parameters */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
          <User className="w-4 h-4 text-sky-600" />
          ASTRONAUT MISSION PROFILE
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-0.5">Crew Member Name</span>
            <span className="text-slate-900 font-bold">{profile?.name || "Dr. Elena Vance"}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-0.5">Callsign & Role</span>
            <span className="text-sky-700 font-bold">{profile?.callsign} • {profile?.role}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-0.5">Mission Designation</span>
            <span className="text-slate-800 font-semibold">{profile?.mission_name}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-0.5">Mission Sol</span>
            <span className="text-sky-700 font-bold">Sol {profile?.mission_sol} of {profile?.mission_duration_days}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-0.5">Habitat Vessel</span>
            <span className="text-slate-800 font-semibold">{profile?.vessel}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-0.5">Orbital Insertion</span>
            <span className="text-slate-800 font-semibold">{profile?.craft_orbit}</span>
          </div>
        </div>
      </div>

      {/* 2. Offline Storage & Ground Sync Hub */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-600" />
            OFFLINE STORAGE (INDEXEDDB) & GROUND SYNC HUB
          </h2>

          <button
            onClick={toggleConnection}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
              connectionStatus === 'ONLINE'
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {connectionStatus === 'ONLINE' ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate Space Offline Mode</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Switch to Online Downlink</span>
              </>
            )}
          </button>
        </div>

        {/* Database storage stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
            <span className="text-sky-700 block text-[10px] uppercase font-semibold mb-0.5">Vitals Records</span>
            <span className="text-sky-900 font-bold text-base">{dbStats.vitals} cached</span>
          </div>

          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
            <span className="text-purple-700 block text-[10px] uppercase font-semibold mb-0.5">Wellness Records</span>
            <span className="text-purple-900 font-bold text-base">{dbStats.wellness} cached</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-700 block text-[10px] uppercase font-semibold mb-0.5">Fitness Records</span>
            <span className="text-emerald-900 font-bold text-base">{dbStats.fitness} cached</span>
          </div>

          <div className={`p-3 rounded-lg border ${pendingCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`block text-[10px] uppercase font-semibold mb-0.5 ${pendingCount > 0 ? 'text-amber-700' : 'text-slate-500'}`}>Pending Sync Queue</span>
            <span className={`font-bold text-base ${pendingCount > 0 ? 'text-amber-900' : 'text-slate-500'}`}>
              {pendingCount} items
            </span>
          </div>
        </div>

        {/* Sync Action */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-slate-800 font-bold block">GROUND TELEMETRY RECONCILIATION</span>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Syncs all biotelemetry, check-in, and workout entries created while in communication blackout.
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing || connectionStatus === 'OFFLINE' || pendingCount === 0}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-xs ${
              pendingCount > 0 && connectionStatus === 'ONLINE'
                ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : `Sync Queue (${pendingCount})`}</span>
          </button>
        </div>
      </div>

      {/* 3. Demo Scenario Selector & Reset Options */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-600" />
          SIMULATION SCENARIO GENERATOR
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="block text-slate-700 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">
              Select Simulated Health Mission Event:
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-xs"
            >
              <option value="fatigue_cascade">
                Gradual RHR Rise + Declining Sleep Duration (Requested Challenge Demo)
              </option>
              <option value="nominal">
                Nominal Microgravity Baseline (All Parameters Stable)
              </option>
              <option value="microgravity_fluid_shift">
                Cephalad Fluid Shift (Systolic BP Surge & Nasal Congestion)
              </option>
              <option value="hypoxic_pocket">
                Localized Habitat Environmental SpO2 Saturation Dip
              </option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="w-full py-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Regenerating...' : 'Regenerate Telemetry & Reseed DB'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Research Prototype Medical Disclaimer */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 space-y-2 leading-relaxed">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <ShieldAlert className="w-4 h-4 text-sky-600" />
          <span>NASA SPACE APPS CHALLENGE 2026 — RESEARCH NOTICE</span>
        </div>
        <p>
          ASTRA (Astronaut Health Intelligence System) is an advanced prototype designed for crew situational awareness and flight surgeon collaboration on long-duration lunar and Martian transit missions.
        </p>
        <p>
          All biometric datasets in this environment are simulated telemetry records. Algorithmic alerts reflect statistical and machine learning anomalies relative to personal baselines and must not be used as clinical medical diagnoses without licensed flight surgeon evaluation.
        </p>
      </div>
    </div>
  );
}
