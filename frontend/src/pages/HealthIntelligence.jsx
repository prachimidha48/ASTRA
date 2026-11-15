import React, { useState } from 'react';
import { 
  BrainCircuit, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { acknowledgeAlert, recalculateBaselines, resetSimulationScenario } from '../services/api';

export default function HealthIntelligence({ 
  baselines, 
  alerts, 
  onRefreshData 
}) {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('fatigue_cascade');
  const [isSwitchingScenario, setIsSwitchingScenario] = useState(false);
  const [activeProtocolAlert, setActiveProtocolAlert] = useState(null);
  const [baselineWindow, setBaselineWindow] = useState(14);
  const [statusFeedback, setStatusFeedback] = useState('');

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      setStatusFeedback(`Alert acknowledged & logged to flight telemetry audit.`);
      onRefreshData();
      setTimeout(() => setStatusFeedback(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await recalculateBaselines(baselineWindow);
      setStatusFeedback(`Personalized baseline profile updated successfully (${baselineWindow}-day window).`);
      onRefreshData();
      setTimeout(() => setStatusFeedback(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleScenarioChange = async (scenarioKey) => {
    setIsSwitchingScenario(true);
    setSelectedScenario(scenarioKey);
    try {
      await resetSimulationScenario(scenarioKey);
      setStatusFeedback(`Switched simulated telemetry scenario to: "${scenarioKey}".`);
      onRefreshData();
      setTimeout(() => setStatusFeedback(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwitchingScenario(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans">
      {/* Page Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-sky-600" />
            HEALTH INTELLIGENCE & ANOMALY DETECTION
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personalized microgravity baselines & explainable aerospace health alerting
          </p>
        </div>

        {/* Demo Scenario Switcher */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-2xs rounded-lg p-1 font-mono text-xs">
          <span className="text-slate-500 font-semibold px-2 hidden sm:inline">DEMO SCENARIO:</span>
          <select
            value={selectedScenario}
            onChange={(e) => handleScenarioChange(e.target.value)}
            disabled={isSwitchingScenario}
            className="bg-slate-50 text-sky-800 font-bold px-2 py-1 rounded border border-slate-300 focus:outline-none focus:border-sky-500 text-xs"
          >
            <option value="fatigue_cascade">RHR Rise + Sleep Deficit (Demo)</option>
            <option value="nominal">Nominal Stable Baseline</option>
            <option value="microgravity_fluid_shift">Cephalad Fluid Shift (BP Surge)</option>
            <option value="hypoxic_pocket">ECLSS Hypoxic / SpO2 Dip</option>
          </select>
        </div>
      </div>

      {/* Notification Toast */}
      {statusFeedback && (
        <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center gap-2 font-mono animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* 1. Scientific Principle: Personalized Baselines vs Universal Fixed Thresholds */}
      <div className="p-5 rounded-xl med-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-wide font-mono">
                PERSONALIZED HEALTH BASELINE SYSTEM
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                14-DAY CALIBRATION
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual normal physiological envelope derived from historical mission telemetry
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500 font-medium">Window:</span>
            <select
              value={baselineWindow}
              onChange={(e) => setBaselineWindow(parseInt(e.target.value))}
              className="bg-white text-slate-800 font-semibold px-2 py-1 rounded border border-slate-300 text-xs shadow-2xs"
            >
              <option value="7">7 Days</option>
              <option value="14">14 Days (Standard)</option>
              <option value="21">21 Days</option>
              <option value="28">28 Days</option>
            </select>

            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>{isRecalculating ? 'Computing...' : 'Recalculate'}</span>
            </button>
          </div>
        </div>

        {/* Aerospace Medical Justification Banner */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-900">Why Fixed Universal Thresholds Fail in Human Spaceflight:</strong>
            <p className="text-slate-600 mt-1">
              Astronauts exhibit distinct pre-mission aerobic fitness, autonomic set points, and individual adaptations to microgravity (e.g., cephalad fluid shift, spaceflight osteopenia, cardiovascular remodeling). A fixed universal threshold of 80 BPM might represent tachycardia for an athlete with a 50 BPM baseline, while being entirely normal for another. ASTRA uses dynamic statistical Z-scores and empirical percentiles (P10–P90) relative to each astronaut's established microgravity baseline.
            </p>
          </div>
        </div>

        {/* Personalized Baseline Statistics Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5 font-semibold">INDICATOR</th>
                <th className="p-2.5 font-semibold">MEAN (μ)</th>
                <th className="p-2.5 font-semibold">STD DEV (σ)</th>
                <th className="p-2.5 font-semibold">MEDIAN</th>
                <th className="p-2.5 font-semibold">NORMAL BAND (P10 - P90)</th>
                <th className="p-2.5 font-semibold">UNIT</th>
                <th className="p-2.5 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(baselines).map(([key, b]) => {
                const labelMap = {
                  heart_rate: 'Heart Rate (Ambient)',
                  resting_heart_rate: 'Resting Heart Rate (RHR)',
                  spo2: 'Blood Oxygen (SpO2)',
                  blood_pressure_sys: 'Systolic Blood Pressure',
                  blood_pressure_dia: 'Diastolic Blood Pressure',
                  body_temp: 'Core Body Temperature',
                  respiratory_rate: 'Respiratory Rate',
                  hrv: 'Heart Rate Variability (rMSSD)',
                  sleep_duration: 'Sleep Duration'
                };
                return (
                  <tr key={key} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 text-slate-900 font-semibold">{labelMap[key] || key}</td>
                    <td className="p-2.5 text-sky-700 font-bold">{b.mean}</td>
                    <td className="p-2.5 text-slate-600">±{b.std_dev}</td>
                    <td className="p-2.5 text-slate-600">{b.median}</td>
                    <td className="p-2.5 text-slate-500">{b.p10} — {b.p90}</td>
                    <td className="p-2.5 text-slate-500">{b.unit}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                        CALIBRATED
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Explainable Anomaly Detection Module & Active Alerts */}
      <div className="p-5 rounded-xl med-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-wide font-mono">
              EXPLAINABLE EARLY WARNING HEALTH ALERTS
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-500">
            ENGINE: <span className="text-sky-700 font-bold">Statistical Multi-Variance + Isolation Forest</span>
          </div>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => {
            const isHigh = alert.severity === 'High';
            const isMod = alert.severity === 'Moderate';
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border transition-all ${
                  alert.acknowledged
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : isHigh
                    ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                    : isMod
                    ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isMod
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {alert.severity.toUpperCase()} SEVERITY
                      </span>
                      <h3 className="text-base font-bold text-slate-900 tracking-wide font-mono">
                        {alert.title}
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-slate-500 flex items-center gap-3">
                      <span>SOL: <strong className="text-sky-700">{alert.sol}</strong></span>
                      <span>•</span>
                      <span>TIMESTAMP: {alert.timestamp.slice(0, 19).replace('T', ' ')} UTC</span>
                      <span>•</span>
                      <span>INDICATOR: <strong className="text-slate-800 font-semibold">{alert.metric}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.acknowledged ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
                        <CheckCircle className="w-4 h-4" />
                        <span>ACKNOWLEDGED</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold font-mono shadow-xs transition-colors"
                      >
                        Acknowledge Alert
                      </button>
                    )}

                    <button
                      onClick={() => setActiveProtocolAlert(alert)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-semibold border border-slate-300 transition-colors shadow-2xs"
                    >
                      View Details & Protocol
                    </button>
                  </div>
                </div>

                {/* Quantitative Comparison Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-3 p-3 rounded-lg bg-white border border-slate-200 font-mono text-xs shadow-2xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">PERSONAL BASELINE (μ)</span>
                    <span className="text-sky-700 font-bold text-sm">{alert.baseline_value}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">CURRENT MEASUREMENT</span>
                    <span className={`font-bold text-sm ${isHigh ? 'text-rose-700' : 'text-amber-700'}`}>
                      {alert.current_value}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">OBSERVED DEVIATION</span>
                    <span className="text-slate-900 font-bold text-sm">
                      {alert.current_value > alert.baseline_value ? '+' : ''}
                      {Math.round((alert.current_value - alert.baseline_value) * 10) / 10}
                    </span>
                  </div>
                </div>

                {/* Explainable Detection Reasoning */}
                <div className="text-xs text-slate-700 leading-relaxed space-y-1 mb-3">
                  <strong className="text-slate-900 font-mono text-[11px] block font-bold">
                    REASON FOR DETECTION:
                  </strong>
                  <p>{alert.reason}</p>
                </div>

                {/* Predefined Medically Reviewed Guidance */}
                <div className="p-3 rounded-lg bg-sky-50/70 border border-sky-100 text-xs font-mono text-sky-950 leading-relaxed">
                  <strong className="text-sky-800 block text-[10px] mb-1 font-bold">
                    NASA AEROMEDICAL COUNTERMEASURE GUIDANCE:
                  </strong>
                  {alert.recommended_action}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Protocol / Checklist Detail Modal */}
      {activeProtocolAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden text-slate-800">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 tracking-wide font-mono text-sm">
                  CLINICAL PROTOCOL — {activeProtocolAlert.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveProtocolAlert(null)}
                className="text-slate-500 hover:text-slate-900 text-xs font-mono font-semibold"
              >
                [CLOSE]
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600 font-bold block mb-1">DETECTION CRITERIA:</span>
                <p className="text-slate-800 leading-relaxed">{activeProtocolAlert.reason}</p>
              </div>

              <div className="space-y-2">
                <span className="text-sky-800 font-bold block">FLIGHT SURGEON COUNTERMEASURE CHECKLIST:</span>
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-sky-600" />
                  <span className="text-slate-800">Step 1: Check habitat environmental sensors (CO2 scrubber & O2 partial pressure)</span>
                </label>
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-sky-600" />
                  <span className="text-slate-800">Step 2: Inspect biotelemetry sensor calibration and electrode contact</span>
                </label>
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" className="mt-0.5 accent-sky-600" />
                  <span className="text-slate-800">Step 3: Implement scheduled 45-min sleep opportunity extension</span>
                </label>
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" className="mt-0.5 accent-sky-600" />
                  <span className="text-slate-800">Step 4: Transmit telemetry sync log to ground flight surgeon</span>
                </label>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed text-[11px]">
                <strong className="text-slate-800 block mb-0.5 font-bold">DISCLAIMER:</strong>
                This system provides decision support and physiological trend intelligence. Algorithmic alerts represent deviations from individual baseline telemetry and do not constitute a confirmed diagnostic assessment.
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  handleAcknowledge(activeProtocolAlert.id);
                  setActiveProtocolAlert(null);
                }}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-mono text-xs font-semibold shadow-xs"
              >
                Acknowledge & Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
