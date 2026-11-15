import React, { useState } from 'react';
import { 
  Moon, 
  Smile, 
  AlertCircle, 
  Save, 
  BatteryCharging, 
  CheckCircle2, 
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { logWellnessCheckin } from '../services/api';

export default function MentalWellness({ 
  wellness, 
  onRefreshData,
  currentSol = 68 
}) {
  const [formData, setFormData] = useState({
    sol: currentSol,
    mood: 8,
    stress_level: 4,
    energy_level: 7,
    sleep_quality: 7,
    fatigue_level: 4,
    sleep_duration: 7.2,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const latest = wellness[wellness.length - 1] || {
    mood: 8,
    stress_level: 3,
    energy_level: 8,
    sleep_quality: 8,
    fatigue_level: 3,
    sleep_duration: 7.5,
    rem_sleep_duration: 1.6,
    deep_sleep_duration: 1.8,
    light_sleep_duration: 4.1
  };

  const chartData = wellness.slice(-14).map(w => ({
    sol: `Sol ${w.sol}`,
    mood: w.mood,
    stress: w.stress_level,
    energy: w.energy_level,
    sleep_quality: w.sleep_quality,
    fatigue: w.fatigue_level,
    sleep_duration: w.sleep_duration,
    rem: w.rem_sleep_duration || Math.round(w.sleep_duration * 0.22 * 10) / 10,
    deep: w.deep_sleep_duration || Math.round(w.sleep_duration * 0.24 * 10) / 10,
    light: w.light_sleep_duration || Math.round(w.sleep_duration * 0.54 * 10) / 10
  }));

  const recent7 = wellness.slice(-7);
  const avgMood = recent7.length ? Math.round((recent7.reduce((a, b) => a + b.mood, 0) / recent7.length) * 10) / 10 : 8;
  const avgStress = recent7.length ? Math.round((recent7.reduce((a, b) => a + b.stress_level, 0) / recent7.length) * 10) / 10 : 3;
  const avgSleep = recent7.length ? Math.round((recent7.reduce((a, b) => a + b.sleep_duration, 0) / recent7.length) * 10) / 10 : 7.4;
  const avgFatigue = recent7.length ? Math.round((recent7.reduce((a, b) => a + b.fatigue_level, 0) / recent7.length) * 10) / 10 : 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await logWellnessCheckin({
        ...formData,
        sol: parseInt(formData.sol),
        sleep_duration: parseFloat(formData.sleep_duration)
      });
      setSuccessMessage('Daily wellness & sleep assessment saved successfully.');
      onRefreshData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <Moon className="w-5 h-5 text-purple-600" />
            BEHAVIORAL HEALTH & SLEEP MONITORING
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Astronaut circadian tracking, sleep architecture, and subjective self-reported wellness telemetry
          </p>
        </div>

        {/* CSA Bio-Monitor Questionnaire Tag */}
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono flex items-center gap-2 shadow-2xs">
          <span className="w-5 h-5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center justify-center text-[9px]">
            CSA
          </span>
          <span className="text-slate-700">
            Validated Assessment Schema: <strong className="text-sky-700">CSA Space Health Study Questionnaire</strong>
          </span>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mood */}
        <div className="p-4 rounded-xl med-card med-card-sky">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono font-semibold">
            <span>7-SOL MOOD INDEX</span>
            <Smile className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{avgMood}</span>
            <span className="text-xs text-slate-500 font-mono">/ 10</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Latest entry: <span className="text-sky-700 font-semibold">{latest.mood}/10</span>
          </div>
        </div>

        {/* Stress */}
        <div className={`p-4 rounded-xl med-card ${avgStress >= 6 ? 'med-card-amber' : 'med-card-sky'}`}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono font-semibold">
            <span>SUBJECTIVE STRESS</span>
            <AlertCircle className={`w-4 h-4 ${avgStress >= 6 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className={`text-2xl font-bold font-mono ${avgStress >= 6 ? 'text-amber-700' : 'text-slate-900'}`}>
              {avgStress}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 10</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Target threshold: &lt; 5.0
          </div>
        </div>

        {/* Sleep Duration */}
        <div className={`p-4 rounded-xl med-card ${avgSleep < 6.2 ? 'med-card-amber' : 'med-card-sky'}`}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono font-semibold">
            <span>AVG SLEEP DURATION</span>
            <Moon className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{avgSleep}</span>
            <span className="text-xs text-slate-500 font-mono">hrs</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Circadian target: 7.0 - 8.5h
          </div>
        </div>

        {/* Fatigue */}
        <div className={`p-4 rounded-xl med-card ${avgFatigue >= 6 ? 'med-card-rose' : 'med-card-sky'}`}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono font-semibold">
            <span>FATIGUE SCORE</span>
            <BatteryCharging className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className={`text-2xl font-bold font-mono ${avgFatigue >= 6 ? 'text-rose-700' : 'text-slate-900'}`}>
              {avgFatigue}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 10</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {avgFatigue >= 6 ? 'Elevated sleep debt' : 'Nominal recovery'}
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Check-in Form, Right = Sleep Architecture & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Daily Check-in Form */}
        <div className="p-5 rounded-xl med-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide font-mono">
              DAILY ASTRONAUT CHECK-IN (SOL {currentSol})
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
              ORBITAL SLEEP LOG
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sleep duration */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-700 font-semibold">TOTAL SLEEP DURATION</span>
                <span className="text-sky-700 font-bold">{formData.sleep_duration} hours</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="10.0"
                step="0.1"
                value={formData.sleep_duration}
                onChange={(e) => setFormData({ ...formData, sleep_duration: parseFloat(e.target.value) })}
                className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Mood */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-700 font-semibold">MOOD RATING</span>
                <span className="text-sky-700 font-bold">{formData.mood} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
                className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>1 (Low / Isolated)</span>
                <span>10 (Optimal)</span>
              </div>
            </div>

            {/* Stress */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-700 font-semibold">STRESS LEVEL</span>
                <span className={`font-bold ${formData.stress_level >= 7 ? 'text-amber-700' : 'text-sky-700'}`}>
                  {formData.stress_level} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.stress_level}
                onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Energy */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-700 font-semibold">ENERGY LEVEL</span>
                <span className="text-sky-700 font-bold">{formData.energy_level} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy_level}
                onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Fatigue */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-700 font-semibold">FATIGUE LEVEL</span>
                <span className={`font-bold ${formData.fatigue_level >= 7 ? 'text-rose-700' : 'text-sky-700'}`}>
                  {formData.fatigue_level} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.fatigue_level}
                onChange={(e) => setFormData({ ...formData, fatigue_level: parseInt(e.target.value) })}
                className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                SUBJECTIVE MISSION REMARKS
              </label>
              <textarea
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Log sleep cabin acoustics, confinement symptoms, workload..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Commit Check-in'}</span>
            </button>
          </form>
        </div>

        {/* Right: Charts for Sleep Architecture & Weekly Wellness Trends */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Sleep Stage Architecture (REM, Deep, Light) */}
          <div className="p-5 rounded-xl med-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-mono">
                  SLEEP ARCHITECTURE & DURATION (LAST 14 SOLS)
                </h2>
                <p className="text-xs text-slate-500">
                  Polysomnography breakdown: REM (Rapid Eye Movement), Slow-Wave Deep, Light
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700">
                LATEST: {latest.sleep_duration} hrs
              </span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="sol" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} unit="h" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend />
                  <Bar dataKey="deep" stackId="a" fill="#2563eb" name="Deep (SWS)" />
                  <Bar dataKey="rem" stackId="a" fill="#7c3aed" name="REM Sleep" />
                  <Bar dataKey="light" stackId="a" fill="#e2e8f0" stroke="#cbd5e1" name="Light Sleep" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Weekly Wellness & Stress Trends */}
          <div className="p-5 rounded-xl med-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-mono">
                  MULTIVARIATE PSYCHOLOGICAL TRENDS
                </h2>
                <p className="text-xs text-slate-500">
                  Mood vs Stress vs Fatigue progression
                </p>
              </div>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="sol" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} domain={[1, 10]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="mood" stroke="#0284c7" strokeWidth={2.5} name="Mood (1-10)" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="stress" stroke="#d97706" strokeWidth={2.5} name="Stress Level" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="fatigue" stroke="#e11d48" strokeWidth={2.5} name="Fatigue Level" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Wellness Summary & Non-Diagnostic Advisory */}
      <div className="p-4 rounded-xl med-card text-xs text-slate-700 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-600" />
          <strong className="text-slate-900 font-mono">INTELLIGENCE WELLNESS SUMMARY & MEDICAL BOUNDARY</strong>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Over the past 7 Sols, Dr. Elena Vance shows an average sleep duration of {avgSleep} hours with an average stress score of {avgStress}/10 and fatigue score of {avgFatigue}/10. 
          {avgSleep < 6.0 
            ? " A downward trend in restorative sleep has been flagged by the anomaly detection engine. Circadian lighting adjustments and active recovery schedules are advised."
            : " Circadian rhythms and subjective stress metrics remain stable within the astronaut's nominal psychological baseline envelope."
          }
        </p>
        <p className="text-[11px] text-slate-500 font-mono">
          * Notice: ASTRA does not diagnose clinical depression, generalized anxiety disorder, or psychiatric conditions. This module serves strictly for crew situational awareness and flight surgeon review.
        </p>
      </div>
    </div>
  );
}
