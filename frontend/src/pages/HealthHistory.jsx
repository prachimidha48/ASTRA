import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Eye, 
  ChevronRight, 
  Heart, 
  Moon, 
  Dumbbell, 
  ShieldAlert,
  X
} from 'lucide-react';

export default function HealthHistory({ 
  vitals, 
  wellness, 
  fitness, 
  alerts 
}) {
  const [activeTab, setActiveTab] = useState('vitals');
  const [solFilter, setSolFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filter helper
  const filterBySol = (items) => {
    let result = [...items];
    if (solFilter === '7') {
      result = result.slice(-7);
    } else if (solFilter === '14') {
      result = result.slice(-14);
    } else if (solFilter === '30') {
      result = result.slice(-30);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        String(item.sol).includes(q) || 
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.activity_type && item.activity_type.toLowerCase().includes(q))
      );
    }
    return result.reverse();
  };

  const filteredVitals = filterBySol(vitals);
  const filteredWellness = filterBySol(wellness);
  const filteredFitness = filterBySol(fitness);
  const filteredAlerts = filterBySol(alerts);

  const exportCSV = () => {
    let headers = [];
    let rows = [];
    if (activeTab === 'vitals') {
      headers = ['Sol', 'Timestamp', 'HeartRate', 'RestingHR', 'SpO2', 'BPSystolic', 'BPDiastolic', 'Temp', 'RespRate', 'HRV'];
      rows = filteredVitals.map(v => [v.sol, v.timestamp, v.heart_rate, v.resting_heart_rate, v.spo2, v.blood_pressure_sys, v.blood_pressure_dia, v.body_temp, v.respiratory_rate, v.hrv]);
    } else if (activeTab === 'wellness') {
      headers = ['Sol', 'Timestamp', 'SleepDuration', 'Mood', 'Stress', 'Energy', 'Fatigue', 'Notes'];
      rows = filteredWellness.map(w => [w.sol, w.timestamp, w.sleep_duration, w.mood, w.stress_level, w.energy_level, w.fatigue_level, `"${w.notes || ''}"`]);
    } else if (activeTab === 'fitness') {
      headers = ['Sol', 'Timestamp', 'Activity', 'DurationMins', 'Intensity', 'AvgHR', 'Calories', 'LoadKg'];
      rows = filteredFitness.map(f => [f.sol, f.timestamp, `"${f.activity_type}"`, f.duration_minutes, f.intensity, f.avg_heart_rate, f.calories_burned, f.load_kg]);
    } else {
      headers = ['Sol', 'Timestamp', 'Severity', 'Title', 'Metric', 'Baseline', 'Observed', 'Reason'];
      rows = filteredAlerts.map(a => [a.sol, a.timestamp, a.severity, `"${a.title}"`, a.metric, a.baseline_value, a.current_value, `"${a.reason}"`]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASTRA_${activeTab}_history_sol68.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            MISSION HEALTH RECORDS & AUDIT TRAIL
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical biotelemetry archive stored in IndexedDB with local query & CSV export capability
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-sky-700 border border-slate-200 text-xs font-mono font-semibold transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export {activeTab.toUpperCase()} CSV</span>
        </button>
      </div>

      {/* Control Strip: Tabs & Filters */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Subsystem tabs */}
          <div className="flex rounded-lg bg-slate-100 border border-slate-200 p-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'vitals' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Vitals ({filteredVitals.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('wellness')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'wellness' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Wellness & Sleep ({filteredWellness.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('fitness')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'fitness' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Fitness ({filteredFitness.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'alerts' ? 'bg-rose-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Alert Audit ({filteredAlerts.length})</span>
            </button>
          </div>

          {/* Search & Sol Range Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Sol or remarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 font-mono w-48"
              />
            </div>

            <div className="flex rounded-lg bg-slate-100 border border-slate-200 p-1 font-mono text-xs">
              <button
                onClick={() => setSolFilter('7')}
                className={`px-2.5 py-1 rounded-md transition-colors ${solFilter === '7' ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
              >
                7 Sols
              </button>
              <button
                onClick={() => setSolFilter('14')}
                className={`px-2.5 py-1 rounded-md transition-colors ${solFilter === '14' ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
              >
                14 Sols
              </button>
              <button
                onClick={() => setSolFilter('30')}
                className={`px-2.5 py-1 rounded-md transition-colors ${solFilter === '30' ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
              >
                30 Sols
              </button>
              <button
                onClick={() => setSolFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${solFilter === 'ALL' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          {activeTab === 'vitals' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold uppercase tracking-wider">Mission Sol</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Timestamp (UTC)</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">HR / RHR (BPM)</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">SpO2 (%)</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">BP (mmHg)</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Temp (°C)</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">HRV (ms)</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Source</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredVitals.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-sky-700 font-bold">Sol {v.sol}</td>
                    <td className="p-3 text-slate-500">{v.timestamp.slice(0, 16).replace('T', ' ')}</td>
                    <td className="p-3 text-slate-900 font-semibold">{v.heart_rate} / {v.resting_heart_rate}</td>
                    <td className="p-3 text-emerald-700 font-semibold">{v.spo2}%</td>
                    <td className="p-3 text-slate-700">{v.blood_pressure_sys}/{v.blood_pressure_dia}</td>
                    <td className="p-3 text-slate-700">{v.body_temp}°C</td>
                    <td className="p-3 text-purple-700 font-semibold">{v.hrv} ms</td>
                    <td className="p-3 text-slate-400 text-[10px] truncate max-w-[120px]">{v.source}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedRecord({ type: 'vitals', data: v })}
                        className="p-1.5 rounded-md text-sky-600 hover:bg-sky-50 hover:text-sky-800 transition-colors"
                        title="View Telemetry Record"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'wellness' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold uppercase tracking-wider">Mission Sol</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Sleep Duration</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">REM / Deep</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Mood</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Stress</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Fatigue</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Qualitative Notes</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredWellness.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-sky-700 font-bold">Sol {w.sol}</td>
                    <td className="p-3 text-purple-700 font-bold">{w.sleep_duration} hrs</td>
                    <td className="p-3 text-slate-500">{w.rem_sleep_duration || '—'}h / {w.deep_sleep_duration || '—'}h</td>
                    <td className="p-3 text-slate-900 font-semibold">{w.mood}/10</td>
                    <td className="p-3 text-amber-700 font-semibold">{w.stress_level}/10</td>
                    <td className="p-3 text-rose-700 font-semibold">{w.fatigue_level}/10</td>
                    <td className="p-3 text-slate-600 text-xs truncate max-w-[260px]">{w.notes || 'Nominal'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedRecord({ type: 'wellness', data: w })}
                        className="p-1.5 rounded-md text-sky-600 hover:bg-sky-50 hover:text-sky-800 transition-colors"
                        title="View Record Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'fitness' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold uppercase tracking-wider">Mission Sol</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Protocol Category</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Duration</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Intensity</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Avg / Peak HR</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Calories</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Load Equivalent</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredFitness.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-sky-700 font-bold">Sol {f.sol}</td>
                    <td className="p-3 text-slate-900 font-semibold">{f.activity_type}</td>
                    <td className="p-3 text-slate-700">{f.duration_minutes} mins</td>
                    <td className="p-3 text-sky-700 font-semibold">{f.intensity}</td>
                    <td className="p-3 text-slate-700">{f.avg_heart_rate} / {f.peak_heart_rate} BPM</td>
                    <td className="p-3 text-amber-700 font-bold">{f.calories_burned} kcal</td>
                    <td className="p-3 text-slate-500">{f.load_kg ? `${f.load_kg} kg` : '—'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedRecord({ type: 'fitness', data: f })}
                        className="p-1.5 rounded-md text-sky-600 hover:bg-sky-50 hover:text-sky-800 transition-colors"
                        title="View Workout Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'alerts' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold uppercase tracking-wider">Mission Sol</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Alert Title</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Severity</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Indicator</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Baseline vs Observed</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-3 font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredAlerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-sky-700 font-bold">Sol {a.sol}</td>
                    <td className="p-3 text-slate-900 font-semibold">{a.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.severity === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{a.metric}</td>
                    <td className="p-3 text-slate-600">{a.baseline_value} → {a.current_value}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        a.acknowledged ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {a.acknowledged ? 'ACKNOWLEDGED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedRecord({ type: 'alert', data: a })}
                        className="p-1.5 rounded-md text-sky-600 hover:bg-sky-50 hover:text-sky-800 transition-colors"
                        title="View Alert Audit Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-mono text-sm font-bold text-slate-900 tracking-wide">
                TELEMETRY RECORD — SOL {selectedRecord.data.sol}
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 font-mono text-xs space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-slate-500">RECORD ID: <span className="text-slate-900 font-semibold">{selectedRecord.data.id}</span></div>
                <div className="text-slate-500">TIMESTAMP: <span className="text-sky-700 font-semibold">{selectedRecord.data.timestamp}</span></div>
                <div className="text-slate-500">TYPE: <span className="text-slate-800 font-semibold uppercase">{selectedRecord.type}</span></div>
              </div>

              <pre className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 overflow-x-auto text-[11px] leading-relaxed max-h-72">
                {JSON.stringify(selectedRecord.data, null, 2)}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-mono text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
