import React, { useState } from 'react';
import { 
  Heart, 
  Droplet, 
  Activity, 
  Thermometer, 
  Moon, 
  Dumbbell, 
  ShieldAlert, 
  ArrowRight,
  Gauge,
  CheckCircle2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';

export default function Overview({ 
  profile, 
  vitals, 
  wellness, 
  fitness, 
  baselines, 
  alerts, 
  rangeView, 
  setRangeView, 
  onNavigateToIntelligence,
  onOpenLogModal
}) {
  const [selectedMetric, setSelectedMetric] = useState('heart_rate');

  const latestVital = vitals[vitals.length - 1] || {
    heart_rate: 68,
    resting_heart_rate: 58,
    spo2: 98.4,
    blood_pressure_sys: 116,
    blood_pressure_dia: 74,
    body_temp: 36.6,
    hrv: 58
  };

  const prevVital = vitals[vitals.length - 2] || latestVital;
  const latestWellness = wellness[wellness.length - 1] || { sleep_duration: 7.5, fatigue_level: 3 };
  const prevWellness = wellness[wellness.length - 2] || latestWellness;
  const latestFitness = fitness[fitness.length - 1] || { duration_minutes: 60, calories_burned: 480 };

  const getCardData = (metricKey, currentVal, prevVal, unit) => {
    const base = baselines[metricKey];
    const diffPrev = Math.round((currentVal - prevVal) * 10) / 10;
    const baseMean = base?.mean ?? currentVal;
    const baseStd = base?.std_dev || 1;
    const zScore = Math.round(((currentVal - baseMean) / baseStd) * 10) / 10;
    const isAnomaly = Math.abs(zScore) >= 2.0;

    return {
      current: currentVal,
      unit,
      diffPrev,
      baseMean,
      zScore,
      isAnomaly,
      status: isAnomaly ? 'DEVIATION' : 'NOMINAL'
    };
  };

  const hrCard = getCardData('heart_rate', latestVital.heart_rate, prevVital.heart_rate, 'BPM');
  const rhrCard = getCardData('resting_heart_rate', latestVital.resting_heart_rate, prevVital.resting_heart_rate, 'BPM');
  const spo2Card = getCardData('spo2', latestVital.spo2, prevVital.spo2, '%');
  const bpCard = getCardData('blood_pressure_sys', latestVital.blood_pressure_sys, prevVital.blood_pressure_sys, 'mmHg');
  const tempCard = getCardData('body_temp', latestVital.body_temp, prevVital.body_temp, '°C');
  const sleepCard = getCardData('sleep_duration', latestWellness.sleep_duration, prevWellness.sleep_duration, 'hrs');

  const activeAlerts = alerts.filter(a => !a.acknowledged);

  const sparklineData = vitals.slice(-10).map(v => ({
    sol: v.sol,
    hr: v.heart_rate,
    rhr: v.resting_heart_rate,
    spo2: v.spo2,
    bp: v.blood_pressure_sys,
    temp: v.body_temp
  }));

  const chartMetrics = {
    heart_rate: { name: 'Heart Rate', key: 'heart_rate', color: '#0284c7', unit: 'BPM' },
    resting_heart_rate: { name: 'Resting HR', key: 'resting_heart_rate', color: '#d97706', unit: 'BPM' },
    spo2: { name: 'SpO2 Oxygen', key: 'spo2', color: '#059669', unit: '%' },
    blood_pressure_sys: { name: 'Blood Pressure (Sys)', key: 'blood_pressure_sys', color: '#db2777', unit: 'mmHg' },
    sleep_duration: { name: 'Sleep Duration', key: 'sleep_duration', color: '#7c3aed', unit: 'hrs' }
  };

  const mergedTrends = vitals.map(v => {
    const wel = wellness.find(w => w.sol === v.sol);
    return {
      sol: `Sol ${v.sol}`,
      solNum: v.sol,
      heart_rate: v.heart_rate,
      resting_heart_rate: v.resting_heart_rate,
      spo2: v.spo2,
      blood_pressure_sys: v.blood_pressure_sys,
      sleep_duration: wel ? wel.sleep_duration : 7.4
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans">
      {/* 1. Mission Information Strip */}
      <div className="p-5 rounded-xl med-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={profile?.avatar_url || "./avatar.svg"} 
            alt={profile?.name} 
            className="w-14 h-14 rounded-full border-2 border-sky-600 object-cover shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-wide">{profile?.name || "Dr. Elena Vance"}</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-mono font-bold border border-sky-200">
                {profile?.callsign || "Valkyrie-1"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
              <span>ROLE: <strong className="text-slate-800 font-semibold">{profile?.role}</strong></span>
              <span>•</span>
              <span>MISSION: <strong className="text-slate-800 font-semibold">{profile?.mission_name}</strong></span>
              <span>•</span>
              <span>HABITAT: <strong className="text-sky-700 font-semibold">{profile?.vessel}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
          <div className="text-right font-mono">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">MONITORING STATUS</div>
            <div className="text-xs font-bold text-emerald-700 flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {profile?.status || "Nominal Telemetry"}
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">INDIVIDUAL BASELINE</div>
            <div className="text-xs font-bold text-sky-700">
              14-Day Microgravity Profile
            </div>
          </div>
        </div>
      </div>

      {/* 2. Health Overview Cards (6 Cards with Sparklines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Heart Rate */}
        <div className={`p-4 rounded-xl med-card ${hrCard.isAnomaly ? 'med-card-rose' : 'med-card-sky'}`}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Heart className="w-4 h-4 text-sky-600" />
              HEART RATE
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              hrCard.isAnomaly ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {hrCard.status}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{latestVital.heart_rate}</span>
            <span className="text-xs text-slate-500 font-mono font-medium">BPM</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <span>Resting: </span>
            <span className={`font-semibold ${rhrCard.isAnomaly ? 'text-amber-700 font-bold' : 'text-slate-800'}`}>
              {latestVital.resting_heart_rate} BPM
            </span>
            {rhrCard.isAnomaly && <span className="text-amber-700 text-[10px] font-bold">({rhrCard.zScore}σ)</span>}
          </div>

          <div className="h-9 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <Area type="monotone" dataKey="hr" stroke="#0284c7" fill="#0284c7" fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SpO2 */}
        <div className={`p-4 rounded-xl med-card ${spo2Card.isAnomaly ? 'med-card-rose' : 'med-card-emerald'}`}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Droplet className="w-4 h-4 text-emerald-600" />
              BLOOD OXYGEN
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
              {spo2Card.status}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{latestVital.spo2}</span>
            <span className="text-xs text-slate-500 font-mono font-medium">%</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Baseline: <span className="text-slate-800 font-semibold">{spo2Card.baseMean}%</span>
          </div>

          <div className="h-9 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <Area type="monotone" dataKey="spo2" stroke="#059669" fill="#059669" fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className={`p-4 rounded-xl med-card ${bpCard.isAnomaly ? 'med-card-amber' : 'med-card-sky'}`}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Activity className="w-4 h-4 text-pink-600" />
              BLOOD PRESSURE
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              bpCard.isAnomaly ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
            }`}>
              {bpCard.status}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-xl font-bold font-mono text-slate-900">
              {latestVital.blood_pressure_sys}/{latestVital.blood_pressure_dia}
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">mmHg</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Baseline: <span className="text-slate-800 font-semibold">{bpCard.baseMean} sys</span>
          </div>

          <div className="h-9 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <Area type="monotone" dataKey="bp" stroke="#db2777" fill="#db2777" fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Temperature */}
        <div className="p-4 rounded-xl med-card med-card-sky">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Thermometer className="w-4 h-4 text-sky-600" />
              TEMPERATURE
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
              NOMINAL
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{latestVital.body_temp}</span>
            <span className="text-xs text-slate-500 font-mono font-medium">°C</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Core Sensor: <span className="text-slate-800 font-semibold">{latestVital.body_temp}°C</span>
          </div>

          <div className="h-9 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <Area type="monotone" dataKey="temp" stroke="#0284c7" fill="#0284c7" fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Duration */}
        <div className={`p-4 rounded-xl med-card ${sleepCard.isAnomaly ? 'med-card-amber' : 'med-card-sky'}`}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Moon className="w-4 h-4 text-purple-600" />
              SLEEP DURATION
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              sleepCard.isAnomaly ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {sleepCard.isAnomaly ? 'DEFICIT' : 'OPTIMAL'}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{latestWellness.sleep_duration}</span>
            <span className="text-xs text-slate-500 font-mono font-medium">hrs</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Target Baseline: <span className="text-slate-800 font-semibold">{sleepCard.baseMean}h</span>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-purple-700 font-semibold">
            <span>REM: {latestWellness.rem_sleep_duration || 1.1}h</span>
            <span>•</span>
            <span>Deep: {latestWellness.deep_sleep_duration || 1.2}h</span>
          </div>
        </div>

        {/* Daily Physical Activity */}
        <div className="p-4 rounded-xl med-card med-card-sky">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Dumbbell className="w-4 h-4 text-sky-600" />
              EXERCISE
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-sky-100 text-sky-800">
              LOGGED
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{latestFitness.duration_minutes}</span>
            <span className="text-xs text-slate-500 font-mono font-medium">mins</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Burn: <span className="text-sky-700 font-semibold">{latestFitness.calories_burned} kcal</span>
          </div>

          <div className="mt-2.5 text-[10px] text-slate-600 truncate font-mono font-semibold">
            {latestFitness.activity_type || "ARED Resistive"}
          </div>
        </div>
      </div>

      {/* 3. Main Trends Section with 24h, 7d, 30d views */}
      <div className="p-6 rounded-xl med-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-wide font-mono">
                PHYSIOLOGICAL TELEMETRY TRENDS
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                DYNAMIC BIO-SENSORS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized multi-cycle trend analysis with baseline projection
            </p>
          </div>

          {/* Time range view buttons */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-100 border border-slate-200 p-1 font-mono text-xs">
              <button
                onClick={() => setRangeView('24h')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  rangeView === '24h'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setRangeView('7d')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  rangeView === '7d'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Sols
              </button>
              <button
                onClick={() => setRangeView('30d')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  rangeView === '30d'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Sols
              </button>
            </div>
          </div>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {Object.entries(chartMetrics).map(([key, item]) => {
            const isSelected = selectedMetric === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-sky-50 text-sky-800 border border-sky-300 font-bold shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Recharts Graph */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mergedTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartMetrics[selectedMetric]?.color || '#0284c7'} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={chartMetrics[selectedMetric]?.color || '#0284c7'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="sol" 
                stroke="#94a3b8" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#cbd5e1', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  color: '#0f172a',
                  fontFamily: 'monospace',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={chartMetrics[selectedMetric]?.color || '#0284c7'} 
                fillOpacity={1} 
                fill="url(#metricGrad)" 
                strokeWidth={2.5}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Active Anomaly Alert & Countermeasure Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Intelligence Alert Card */}
        <div className="lg:col-span-2 p-5 rounded-xl med-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-wide font-mono">
                ACTIVE HEALTH ANOMALY INSIGHTS
              </h3>
            </div>
            <button
              onClick={onNavigateToIntelligence}
              className="text-xs text-sky-600 hover:text-sky-700 font-mono font-semibold flex items-center gap-1"
            >
              Intelligence Module <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.slice(0, 2).map((alt) => (
                <div 
                  key={alt.id}
                  className={`p-4 rounded-lg border text-xs ${
                    alt.severity === 'High'
                      ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                      : 'bg-amber-50/80 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold font-mono flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${alt.severity === 'High' ? 'bg-rose-600' : 'bg-amber-600'}`}></span>
                      {alt.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      alt.severity === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {alt.severity.toUpperCase()} PRIORITY
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs leading-relaxed mb-2">
                    {alt.reason}
                  </p>

                  <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-sky-900">
                    <strong className="text-slate-600 block mb-0.5">NASA CLINICAL GUIDELINE:</strong>
                    {alt.recommended_action}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-800">All Biotelemetry Parameters Nominal</div>
              <div className="text-xs text-slate-500 mt-1">No deviations observed outside personal baselines.</div>
            </div>
          )}
        </div>

        {/* Right: Habitat Environmental Telemetry (ECLSS) */}
        <div className="p-5 rounded-xl med-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-wide font-mono">
                HABITAT LIFE SUPPORT (ECLSS)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              NOMINAL
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">CABIN PRESSURE</span>
              <span className="text-slate-900 font-bold">101.3 kPa (1.0 atm)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">PARTIAL PRESSURE O2 (ppO2)</span>
              <span className="text-emerald-700 font-bold">21.2 kPa</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">CARBON DIOXIDE (ppCO2)</span>
              <span className="text-sky-700 font-bold">2.4 mmHg (Nominal)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">AMBIENT ACOUSTIC LEVEL</span>
              <span className="text-slate-900 font-bold">52.8 dBA (Quiet Zone)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">RADIATION DOSIMETRY (RAD)</span>
              <span className="text-sky-700 font-bold">0.42 mSv / Sol</span>
            </div>
          </div>

          <button
            onClick={onOpenLogModal}
            className="w-full py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-mono font-bold border border-sky-200 transition-colors shadow-2xs"
          >
            + Log Astronaut Health Entry
          </button>
        </div>
      </div>
    </div>
  );
}
