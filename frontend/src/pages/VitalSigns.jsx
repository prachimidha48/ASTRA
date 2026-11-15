import React, { useState } from 'react';
import { 
  Heart, 
  Droplet, 
  Activity, 
  Wind, 
  Info, 
  PlusCircle, 
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  ReferenceLine,
  Legend
} from 'recharts';

export default function VitalSigns({ 
  vitals, 
  baselines, 
  onOpenLogModal 
}) {
  const [selectedSubsystem, setSelectedSubsystem] = useState('cardiovascular');

  const latest = vitals[vitals.length - 1] || {};
  const rhrBase = baselines['resting_heart_rate'] || { mean: 58.4, std_dev: 3.8 };
  const spo2Base = baselines['spo2'] || { mean: 98.3, std_dev: 0.7 };
  const bpSysBase = baselines['blood_pressure_sys'] || { mean: 116.5, std_dev: 5.2 };
  const hrvBase = baselines['hrv'] || { mean: 58.6, std_dev: 7.8 };

  const currentMap = latest.blood_pressure_sys && latest.blood_pressure_dia 
    ? Math.round(((2 * latest.blood_pressure_dia + latest.blood_pressure_sys) / 3) * 10) / 10 
    : 88.0;

  const chartData = vitals.map(v => ({
    sol: `Sol ${v.sol}`,
    solNum: v.sol,
    heart_rate: v.heart_rate,
    resting_heart_rate: v.resting_heart_rate,
    rhr_baseline: rhrBase.mean,
    spo2: v.spo2,
    spo2_baseline: spo2Base.mean,
    bp_sys: v.blood_pressure_sys,
    bp_dia: v.blood_pressure_dia,
    bp_sys_baseline: bpSysBase.mean,
    body_temp: v.body_temp,
    respiratory_rate: v.respiratory_rate,
    hrv: v.hrv,
    hrv_baseline: hrvBase.mean,
    map: Math.round(((2 * v.blood_pressure_dia + v.blood_pressure_sys) / 3) * 10) / 10
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans">
      {/* Header & Subsystem switch */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            PHYSIOLOGICAL BIOTELEMETRY SUITE
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-channel telemetry streams cross-referenced with Elena Vance's individual baselines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-slate-100 border border-slate-200 p-1 font-mono text-xs">
            <button
              onClick={() => setSelectedSubsystem('cardiovascular')}
              className={`px-3 py-1.5 rounded-md transition-colors ${selectedSubsystem === 'cardiovascular'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Cardiovascular & HRV
            </button>
            <button
              onClick={() => setSelectedSubsystem('respiratory')}
              className={`px-3 py-1.5 rounded-md transition-colors ${selectedSubsystem === 'respiratory'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              SpO2 & Respiratory
            </button>
            <button
              onClick={() => setSelectedSubsystem('hemodynamics')}
              className={`px-3 py-1.5 rounded-md transition-colors ${selectedSubsystem === 'hemodynamics'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Hemodynamics (BP & MAP)
            </button>
          </div>

          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Reading</span>
          </button>
        </div>
      </div>

      {/* Aeromedical Guidance Banner with CSA Reference & Authenticity Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Aerospace Medical Note */}
        <div className="p-4 rounded-xl med-card text-slate-700 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-900">Aerospace Health: Microgravity Cardiovascular Remodeling</strong>
            <p className="text-slate-600 mt-0.5 text-[11px]">
              Cephalad fluid redistribution causes transient central volume expansion, followed by plasma volume contraction. Resting heart rate elevation (&gt;+1.8σ) and HRV decline signify accumulated autonomic strain.
            </p>
          </div>
        </div>

        {/* Canadian Space Agency Bio-Monitor Architecture Citation */}
        <div className="p-4 rounded-xl med-card text-slate-700 flex items-start gap-3 border-l-4 border-l-rose-500">
          <div className="w-6 h-6 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-bold shrink-0 mt-0.5 text-[10px]">
            CSA
          </div>
          <div className="leading-relaxed">
            <div className="flex items-center gap-2">
              <strong className="text-slate-900">Scientific Reference: CSA Bio-Monitor Study</strong>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                CATEGORY B TELEMETRY
              </span>
            </div>
            <p className="text-slate-600 mt-0.5 text-[11px]">
              Indicator channels (Heart Rate, SpO2, Respiration Rate) are structured per the Canadian Space Agency Space Health smart garment framework. Telemetry values are synthetically generated for demonstration.
            </p>
            <a
              href="https://www.asc-csa.gc.ca/eng/sciences/space-flight-improve-monitor-health-earth.asp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:text-sky-800 text-[10px] underline mt-1 inline-block font-semibold"
            >
              CSA Space Health Study Overview →
            </a>
          </div>
        </div>
      </div>

      {/* Dynamic Subsystem Charts */}
      {selectedSubsystem === 'cardiovascular' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Resting Heart Rate vs Personal Baseline */}
          <div className="p-5 rounded-xl med-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                  <Heart className="w-4 h-4 text-sky-600" />
                  RESTING HEART RATE & BASELINE ENVELOPE
                </h3>
                <p className="text-xs text-slate-500">
                  Target baseline: {rhrBase.mean} BPM (±{rhrBase.std_dev} BPM σ)
                </p>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${latest.resting_heart_rate > rhrBase.mean + 1.8 * rhrBase.std_dev
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-800'
                }`}>
                LATEST: {latest.resting_heart_rate} BPM
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="sol" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} domain={[50, 85]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend />
                  <ReferenceLine y={rhrBase.mean} stroke="#0284c7" strokeDasharray="4 4" label={{ value: 'Personal Baseline', fill: '#0284c7', fontSize: 10 }} />
                  <Line type="monotone" dataKey="resting_heart_rate" stroke="#d97706" strokeWidth={2.5} name="Resting HR (BPM)" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="heart_rate" stroke="#94a3b8" strokeWidth={1.5} name="Ambient HR (BPM)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: HRV (Heart Rate Variability - rMSSD) */}
          <div className="p-5 rounded-xl med-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  HEART RATE VARIABILITY (rMSSD / AUTONOMIC TONE)
                </h3>
                <p className="text-xs text-slate-500">
                  Parasympathetic recovery marker (Baseline: {hrvBase.mean} ms)
                </p>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${latest.hrv < 35 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800'
                }`}>
                LATEST: {latest.hrv} ms
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="sol" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} domain={[20, 80]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend />
                  <ReferenceLine y={hrvBase.mean} stroke="#7c3aed" strokeDasharray="4 4" label={{ value: 'HRV Baseline', fill: '#7c3aed', fontSize: 10 }} />
                  <Line type="monotone" dataKey="hrv" stroke="#7c3aed" strokeWidth={2.5} name="HRV rMSSD (ms)" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {selectedSubsystem === 'respiratory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 3: SpO2 Saturation Curve */}
          <div className="p-5 rounded-xl med-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-emerald-600" />
                  PERIPHERAL BLOOD OXYGEN SATURATION (SpO2)
                </h3>
                <p className="text-xs text-slate-500">
                  Cabin atmosphere: 21.2 kPa ppO2 (Baseline: {spo2Base.mean}%)
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                LATEST: {latest.spo2}%
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="sol" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} domain={[92, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend />
                  <ReferenceLine y={95.0} stroke="#e11d48" strokeDasharray="3 3" label={{ value: 'Hypoxia Threshold (95%)', fill: '#e11d48', fontSize: 10 }} />
                  <ReferenceLine y={spo2Base.mean} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Elena Baseline', fill: '#059669', fontSize: 10 }} />
                  <Line type="monotone" dataKey="spo2" stroke="#059669" strokeWidth={2.5} name="SpO2 (%)" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Respiratory Rate & Core Temperature */}
          <div className="p-5 rounded-xl med-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-600" />
                  RESPIRATORY RATE & BODY TEMPERATURE
                </h3>
                <p className="text-xs text-slate-500">
                  Continuous suit biometric sensors
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                {latest.respiratory_rate} rpm / {latest.body_temp}°C
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="sol" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} domain={[10, 20]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="respiratory_rate" stroke="#0284c7" strokeWidth={2.5} name="Respiratory (breaths/min)" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {selectedSubsystem === 'hemodynamics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 5: Systolic / Diastolic Blood Pressure */}
          <div className="p-5 rounded-xl med-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-pink-600" />
                  ARTERIAL BLOOD PRESSURE (SYSTOLIC & DIASTOLIC)
                </h3>
                <p className="text-xs text-slate-500">
                  Baseline: {bpSysBase.mean}/74 mmHg (Cephalad fluid pressure tracking)
                </p>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${latest.blood_pressure_sys > 128 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
                }`}>
                {latest.blood_pressure_sys}/{latest.blood_pressure_dia} mmHg
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="sol" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} domain={[60, 145]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend />
                  <ReferenceLine y={bpSysBase.mean} stroke="#db2777" strokeDasharray="4 4" label={{ value: 'Systolic Baseline', fill: '#db2777', fontSize: 10 }} />
                  <Line type="monotone" dataKey="bp_sys" stroke="#db2777" strokeWidth={2.5} name="Systolic (mmHg)" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="bp_dia" stroke="#2563eb" strokeWidth={2.5} name="Diastolic (mmHg)" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Mean Arterial Pressure (MAP) */}
          <div className="p-5 rounded-xl med-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  CALCULATED MEAN ARTERIAL PRESSURE (MAP)
                </h3>
                <p className="text-xs text-slate-500">
                  Formula: MAP = (2×Diastolic + Systolic) / 3 (Target: 70 - 105 mmHg)
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                CURRENT MAP: {currentMap} mmHg
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="sol" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} domain={[70, 115]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="map" stroke="#0284c7" strokeWidth={2.5} name="MAP (mmHg)" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Historical Telemetry Table preview */}
      <div className="p-5 rounded-xl med-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 font-mono">
            RECENT TELEMETRY OBSERVATIONS LOG
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Showing last 10 Sols
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5 font-semibold">MISSION SOL</th>
                <th className="p-2.5 font-semibold">HR / RHR (BPM)</th>
                <th className="p-2.5 font-semibold">SpO2 (%)</th>
                <th className="p-2.5 font-semibold">BP (mmHg)</th>
                <th className="p-2.5 font-semibold">MAP</th>
                <th className="p-2.5 font-semibold">TEMP (°C)</th>
                <th className="p-2.5 font-semibold">HRV (ms)</th>
                <th className="p-2.5 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vitals.slice(-10).reverse().map((v) => {
                const isAnom = v.resting_heart_rate > rhrBase.mean + 1.8 * rhrBase.std_dev;
                return (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 text-sky-700 font-bold">Sol {v.sol}</td>
                    <td className="p-2.5 text-slate-800">
                      <span className="font-semibold">{v.heart_rate}</span> /{' '}
                      <span className={isAnom ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                        {v.resting_heart_rate}
                      </span>
                    </td>
                    <td className="p-2.5 text-emerald-700 font-semibold">{v.spo2}%</td>
                    <td className="p-2.5 text-slate-700">{v.blood_pressure_sys}/{v.blood_pressure_dia}</td>
                    <td className="p-2.5 text-slate-700">
                      {Math.round(((2 * v.blood_pressure_dia + v.blood_pressure_sys) / 3) * 10) / 10}
                    </td>
                    <td className="p-2.5 text-slate-700">{v.body_temp}°C</td>
                    <td className="p-2.5 text-purple-700 font-semibold">{v.hrv} ms</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isAnom ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                        {isAnom ? 'DEVIATION' : 'NOMINAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
