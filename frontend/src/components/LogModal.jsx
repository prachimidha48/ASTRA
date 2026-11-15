import React, { useState } from 'react';
import { 
  X, 
  Activity, 
  Moon, 
  Dumbbell, 
  CheckCircle, 
  Save, 
  Info,
  Heart
} from 'lucide-react';
import { logVitals, logWellnessCheckin, logFitnessWorkout } from '../services/api';

export default function LogModal({ isOpen, onClose, baselines, onDataLogged, currentSol = 68 }) {
  const [activeTab, setActiveTab] = useState('vitals');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Vitals State
  const [vitalsForm, setVitalsForm] = useState({
    sol: currentSol,
    heart_rate: 68,
    resting_heart_rate: 58,
    spo2: 98.4,
    blood_pressure_sys: 116,
    blood_pressure_dia: 74,
    body_temp: 36.6,
    respiratory_rate: 14,
    hrv: 58
  });

  // Wellness State
  const [wellnessForm, setWellnessForm] = useState({
    sol: currentSol,
    mood: 8,
    stress_level: 3,
    energy_level: 8,
    sleep_quality: 8,
    fatigue_level: 3,
    sleep_duration: 7.5,
    notes: ''
  });

  // Fitness State
  const [fitnessForm, setFitnessForm] = useState({
    sol: currentSol,
    activity_type: 'CEVIS (Cycle Ergometer)',
    duration_minutes: 60,
    intensity: 'Moderate',
    avg_heart_rate: 135,
    peak_heart_rate: 155,
    calories_burned: 480,
    load_kg: 0,
    notes: 'Microgravity countermeasure workout'
  });

  if (!isOpen) return null;

  // Real-time baseline deviation feedback helper
  const getBaselineDeviation = (metric, value) => {
    const base = baselines[metric];
    if (!base) return null;
    const diff = value - base.mean;
    const sigma = base.std_dev ? diff / base.std_dev : 0;
    const isElevated = Math.abs(sigma) >= 2.0;
    return {
      mean: base.mean,
      std: base.std_dev,
      diff: Math.round(diff * 10) / 10,
      sigma: Math.round(sigma * 10) / 10,
      isElevated,
      unit: base.unit
    };
  };

  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await logVitals({
        ...vitalsForm,
        sol: parseInt(vitalsForm.sol),
        heart_rate: parseFloat(vitalsForm.heart_rate),
        resting_heart_rate: parseFloat(vitalsForm.resting_heart_rate),
        spo2: parseFloat(vitalsForm.spo2),
        blood_pressure_sys: parseFloat(vitalsForm.blood_pressure_sys),
        blood_pressure_dia: parseFloat(vitalsForm.blood_pressure_dia),
        body_temp: parseFloat(vitalsForm.body_temp),
        respiratory_rate: parseFloat(vitalsForm.respiratory_rate),
        hrv: parseFloat(vitalsForm.hrv)
      });
      setSuccessMessage('Telemetry logged successfully (stored locally in IndexedDB & queued for downlink)');
      onDataLogged();
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWellnessSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await logWellnessCheckin({
        ...wellnessForm,
        sol: parseInt(wellnessForm.sol),
        sleep_duration: parseFloat(wellnessForm.sleep_duration)
      });
      setSuccessMessage('Daily wellness & sleep assessment recorded.');
      onDataLogged();
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFitnessSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await logFitnessWorkout({
        ...fitnessForm,
        sol: parseInt(fitnessForm.sol),
        duration_minutes: parseInt(fitnessForm.duration_minutes),
        avg_heart_rate: parseFloat(fitnessForm.avg_heart_rate),
        peak_heart_rate: parseFloat(fitnessForm.peak_heart_rate),
        calories_burned: parseFloat(fitnessForm.calories_burned),
        load_kg: parseFloat(fitnessForm.load_kg)
      });
      setSuccessMessage('Countermeasure exercise logged successfully.');
      onDataLogged();
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rhrDev = getBaselineDeviation('resting_heart_rate', vitalsForm.resting_heart_rate);
  const spo2Dev = getBaselineDeviation('spo2', vitalsForm.spo2);
  const bpDev = getBaselineDeviation('blood_pressure_sys', vitalsForm.blood_pressure_sys);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-wide font-mono">
              ASTRA TELEMETRY DATA ENTRY — SOL {currentSol}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 font-mono text-xs">
          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'vitals'
                ? 'border-sky-600 text-sky-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            PHYSIOLOGICAL VITALS
          </button>
          <button
            onClick={() => setActiveTab('wellness')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'wellness'
                ? 'border-sky-600 text-sky-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Moon className="w-4 h-4" />
            WELLNESS & SLEEP
          </button>
          <button
            onClick={() => setActiveTab('fitness')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'fitness'
                ? 'border-sky-600 text-sky-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            COUNTERMEASURES / FITNESS
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="m-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-mono">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: VITALS FORM */}
          {activeTab === 'vitals' && (
            <form onSubmit={handleVitalsSubmit} className="space-y-4">
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 text-xs text-sky-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  Measurements are cross-referenced with Elena Vance's individual microgravity baseline. Significant deviations (&gt;2.0σ) automatically generate explainable alerts.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Resting Heart Rate */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    RESTING HEART RATE (BPM)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={vitalsForm.resting_heart_rate}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, resting_heart_rate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                  {rhrDev && (
                    <div className={`text-[11px] font-mono mt-1 ${rhrDev.isElevated ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                      Baseline: {rhrDev.mean} BPM ({rhrDev.diff > 0 ? `+${rhrDev.diff}` : rhrDev.diff} BPM, {rhrDev.sigma}σ)
                    </div>
                  )}
                </div>

                {/* Active Heart Rate */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    ACTIVE / AMBIENT HR (BPM)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={vitalsForm.heart_rate}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, heart_rate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                {/* SpO2 */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    BLOOD OXYGEN (SpO2 %)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="80"
                    max="100"
                    value={vitalsForm.spo2}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                  {spo2Dev && (
                    <div className={`text-[11px] font-mono mt-1 ${spo2Dev.isElevated ? 'text-rose-700 font-bold' : 'text-slate-500'}`}>
                      Baseline: {spo2Dev.mean}% ({spo2Dev.diff}% diff)
                    </div>
                  )}
                </div>

                {/* HRV */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    HEART RATE VARIABILITY (rMSSD ms)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={vitalsForm.hrv}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, hrv: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                {/* Blood Pressure Systolic */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    BP SYSTOLIC (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitalsForm.blood_pressure_sys}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, blood_pressure_sys: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                  {bpDev && (
                    <div className={`text-[11px] font-mono mt-1 ${bpDev.isElevated ? 'text-amber-700' : 'text-slate-500'}`}>
                      Baseline: {bpDev.mean} mmHg
                    </div>
                  )}
                </div>

                {/* Blood Pressure Diastolic */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    BP DIASTOLIC (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitalsForm.blood_pressure_dia}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, blood_pressure_dia: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                {/* Body Temperature */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    BODY TEMPERATURE (°C)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={vitalsForm.body_temp}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, body_temp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                {/* Respiratory Rate */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    RESPIRATORY RATE (breaths/min)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={vitalsForm.respiratory_rate}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, respiratory_rate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Commit Telemetry'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: WELLNESS FORM */}
          {activeTab === 'wellness' && (
            <form onSubmit={handleWellnessSubmit} className="space-y-4">
              <div className="space-y-4">
                {/* Sleep Duration */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-700 font-semibold">SLEEP DURATION (HOURS)</span>
                    <span className="text-sky-700 font-bold">{wellnessForm.sleep_duration} hours</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="10.0"
                    step="0.1"
                    value={wellnessForm.sleep_duration}
                    onChange={(e) => setWellnessForm({ ...wellnessForm, sleep_duration: parseFloat(e.target.value) })}
                    className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Mood Rating */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-700 font-semibold">MOOD SCORE</span>
                    <span className="text-sky-700 font-bold">{wellnessForm.mood} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wellnessForm.mood}
                    onChange={(e) => setWellnessForm({ ...wellnessForm, mood: parseInt(e.target.value) })}
                    className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                    <span>1 (Low / Isolated)</span>
                    <span>10 (Optimal / Resilient)</span>
                  </div>
                </div>

                {/* Stress Level */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-700 font-semibold">SUBJECTIVE STRESS LEVEL</span>
                    <span className={`font-bold ${wellnessForm.stress_level >= 7 ? 'text-amber-700' : 'text-sky-700'}`}>
                      {wellnessForm.stress_level} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wellnessForm.stress_level}
                    onChange={(e) => setWellnessForm({ ...wellnessForm, stress_level: parseInt(e.target.value) })}
                    className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                    <span>1 (Relaxed)</span>
                    <span>10 (Severe Overload)</span>
                  </div>
                </div>

                {/* Energy Level */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-700 font-semibold">ENERGY LEVEL</span>
                    <span className="text-sky-700 font-bold">{wellnessForm.energy_level} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wellnessForm.energy_level}
                    onChange={(e) => setWellnessForm({ ...wellnessForm, energy_level: parseInt(e.target.value) })}
                    className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Fatigue Level */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-700 font-semibold">FATIGUE LEVEL</span>
                    <span className={`font-bold ${wellnessForm.fatigue_level >= 7 ? 'text-rose-700' : 'text-sky-700'}`}>
                      {wellnessForm.fatigue_level} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wellnessForm.fatigue_level}
                    onChange={(e) => setWellnessForm({ ...wellnessForm, fatigue_level: parseInt(e.target.value) })}
                    className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Qualitative Notes */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    QUALITATIVE HEALTH & CIRCADIAN NOTES
                  </label>
                  <textarea
                    rows="3"
                    value={wellnessForm.notes}
                    onChange={(e) => setWellnessForm({ ...wellnessForm, notes: e.target.value })}
                    placeholder="Log sleep cabin acoustics, EVA physical exertion, mission remarks..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Record Check-in'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: FITNESS FORM */}
          {activeTab === 'fitness' && (
            <form onSubmit={handleFitnessSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Countermeasure Type */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    EXERCISE PROTOCOL CATEGORY
                  </label>
                  <select
                    value={fitnessForm.activity_type}
                    onChange={(e) => setFitnessForm({ ...fitnessForm, activity_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  >
                    <option value="Treadmill T2 (Bungee Restraint)">Treadmill T2 (Bungee Restraint / Axial Loading)</option>
                    <option value="ARED (Advanced Resistive)">ARED (Advanced Resistive Exercise - Bone & Muscle)</option>
                    <option value="CEVIS (Cycle Ergometer)">CEVIS (Cycle Ergometer with Vibration Isolation)</option>
                    <option value="Pre-EVA Endurance Conditioning">Pre-EVA Endurance Conditioning Protocol</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    DURATION (MINUTES)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={fitnessForm.duration_minutes}
                    onChange={(e) => setFitnessForm({ ...fitnessForm, duration_minutes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                {/* Intensity */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    INTENSITY
                  </label>
                  <select
                    value={fitnessForm.intensity}
                    onChange={(e) => setFitnessForm({ ...fitnessForm, intensity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  >
                    <option value="Moderate">Moderate (60-75% VO2 Max)</option>
                    <option value="High">High (75-85% VO2 Max)</option>
                    <option value="Maximal">Maximal / Interval Protocol (&gt;85%)</option>
                  </select>
                </div>

                {/* Average HR */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    AVG HEART RATE (BPM)
                  </label>
                  <input
                    type="number"
                    value={fitnessForm.avg_heart_rate}
                    onChange={(e) => setFitnessForm({ ...fitnessForm, avg_heart_rate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                {/* Peak HR */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    PEAK HEART RATE (BPM)
                  </label>
                  <input
                    type="number"
                    value={fitnessForm.peak_heart_rate}
                    onChange={(e) => setFitnessForm({ ...fitnessForm, peak_heart_rate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                {/* Calories */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    CALORIES BURNED (kcal)
                  </label>
                  <input
                    type="number"
                    value={fitnessForm.calories_burned}
                    onChange={(e) => setFitnessForm({ ...fitnessForm, calories_burned: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                {/* Load */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">
                    ARED RESISTIVE LOAD (kg equivalent)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={fitnessForm.load_kg}
                    onChange={(e) => setFitnessForm({ ...fitnessForm, load_kg: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Log Exercise Session'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
