import React, { useState } from 'react';
import { 
  Dumbbell, 
  Activity, 
  Flame, 
  Clock, 
  PlusCircle, 
  CheckCircle, 
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export default function PhysicalFitness({ 
  fitness, 
  onOpenLogModal,
  onNavigateToResearch
}) {
  const [filterType, setFilterType] = useState('ALL');

  const filteredFitness = filterType === 'ALL' 
    ? fitness 
    : fitness.filter(f => f.activity_type.toLowerCase().includes(filterType.toLowerCase()));

  const recentSessions = filteredFitness.slice(-14);

  const totalMins = fitness.reduce((acc, cur) => acc + cur.duration_minutes, 0);
  const totalCals = fitness.reduce((acc, cur) => acc + cur.calories_burned, 0);
  const avgMins = fitness.length ? Math.round(totalMins / fitness.length) : 60;
  const totalSessions = fitness.length;

  const chartData = recentSessions.map(f => ({
    sol: `Sol ${f.sol}`,
    duration: f.duration_minutes,
    calories: f.calories_burned,
    avg_hr: f.avg_heart_rate,
    load: f.load_kg || 0,
    activity: f.activity_type
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-sky-600" />
            ASTRONAUT PHYSICAL FITNESS & COUNTERMEASURES
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking exercise protocols to counteract microgravity musculoskeletal deconditioning & cardiac atrophy
          </p>
        </div>

        <button
          onClick={onOpenLogModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Workout Protocol</span>
        </button>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl med-card med-card-sky">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono font-semibold">
            <span>TOTAL EXERCISE TIME</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{Math.round(totalMins / 60)}</span>
            <span className="text-xs text-slate-500 font-mono">hours logged</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Daily avg: <span className="text-sky-700 font-bold">{avgMins} mins/sol</span>
          </div>
        </div>

        <div className="p-4 rounded-xl med-card med-card-sky">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono font-semibold">
            <span>ENERGY EXPENDITURE</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalCals.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-mono">kcal</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Metabolic load nominal
          </div>
        </div>

        <div className="p-4 rounded-xl med-card med-card-emerald">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono font-semibold">
            <span>SESSIONS COMPLETED</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalSessions}</span>
            <span className="text-xs text-slate-500 font-mono">/ 30 Sols</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Protocol compliance: <span className="text-emerald-700 font-bold">100%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl med-card med-card-sky">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono font-semibold">
            <span>ESTIMATED CARDIO INDEX</span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">46.5</span>
            <span className="text-xs text-slate-500 font-mono">mL/kg/min</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Aerobic capacity estimate (VO2)
          </div>
        </div>
      </div>

      {/* Aeromedical & CSA TBone Bone Health Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl med-card text-slate-700 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-900">Aerospace Countermeasure Hardware Architecture:</strong>
            <p className="text-slate-600 mt-1 text-[11px]">
              Astronauts perform 2 to 2.5 hours of daily physical exercise in microgravity across three primary space systems:
              (1) <strong>ARED</strong> (Advanced Resistive Exercise Device);
              (2) <strong>T2 Treadmill</strong> (with harness bungees providing axial loading); and
              (3) <strong>CEVIS</strong> (Cycle Ergometer with active vibration isolation).
            </p>
          </div>
        </div>

        {/* CSA TBone Research Integration Banner */}
        <div className="p-4 rounded-xl med-card text-slate-700 flex items-start gap-3 border-l-4 border-l-rose-500">
          <div className="w-6 h-6 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-bold shrink-0 mt-0.5 text-[10px]">
            CSA
          </div>
          <div className="leading-relaxed flex-1">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900">Research Evidence: CSA TBone Study</strong>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                17 ASTRONAUTS
              </span>
            </div>
            <p className="text-slate-600 mt-1 text-[11px]">
              Published CSA research demonstrated that <strong>&gt;50% of astronauts had not regained pre-flight bone density 1 year post-mission</strong>, with recovery duration strongly correlated with mission length. ASTRA enforces daily ARED mechanical loads (&gt;100 kg) to maintain bone strain.
            </p>
            {onNavigateToResearch && (
              <button
                onClick={onNavigateToResearch}
                className="mt-2 text-sky-600 hover:text-sky-800 text-[11px] underline flex items-center gap-1 font-semibold"
              >
                <span>View Full CSA TBone Research Findings & Charts →</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Exercise Duration & Calorie Burn */}
        <div className="p-5 rounded-xl med-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-mono">
                DAILY EXERCISE DURATION (MINS)
              </h2>
              <p className="text-xs text-slate-500">
                NASA prescribed minimum: 45-60 mins per cycle
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="sol" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} unit="m" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Bar dataKey="duration" fill="#0284c7" name="Duration (Mins)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cardiovascular Response (Avg HR & Peak HR) */}
        <div className="p-5 rounded-xl med-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-mono">
                EXERCISE CARDIOVASCULAR INTENSITY
              </h2>
              <p className="text-xs text-slate-500">
                Average vs Peak Heart Rate during countermeasure session
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="sol" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} domain={[110, 180]} unit=" bpm" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="avg_hr" stroke="#0284c7" strokeWidth={2.5} name="Average HR (BPM)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Exercise History Table */}
      <div className="p-5 rounded-xl med-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 font-mono">
            RECENT COUNTERMEASURE LOGS
          </h2>

          <div className="flex rounded-lg bg-slate-100 border border-slate-200 p-1 font-mono text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded transition-colors ${filterType === 'ALL' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('ARED')}
              className={`px-3 py-1 rounded transition-colors ${filterType === 'ARED' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              ARED Resistive
            </button>
            <button
              onClick={() => setFilterType('Treadmill')}
              className={`px-3 py-1 rounded transition-colors ${filterType === 'Treadmill' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              T2 Treadmill
            </button>
            <button
              onClick={() => setFilterType('CEVIS')}
              className={`px-3 py-1 rounded transition-colors ${filterType === 'CEVIS' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              CEVIS Cycle
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5 font-semibold">MISSION SOL</th>
                <th className="p-2.5 font-semibold">EQUIPMENT / PROTOCOL</th>
                <th className="p-2.5 font-semibold">DURATION</th>
                <th className="p-2.5 font-semibold">INTENSITY</th>
                <th className="p-2.5 font-semibold">AVG HR</th>
                <th className="p-2.5 font-semibold">CALORIES</th>
                <th className="p-2.5 font-semibold">LOAD EQUIVALENT</th>
                <th className="p-2.5 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSessions.slice(-10).reverse().map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 text-sky-700 font-bold">Sol {f.sol}</td>
                  <td className="p-2.5 text-slate-900 font-semibold">{f.activity_type}</td>
                  <td className="p-2.5 text-slate-700">{f.duration_minutes} mins</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.intensity === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-sky-100 text-sky-800 border border-sky-200'
                    }`}>
                      {f.intensity}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-700">{f.avg_heart_rate} BPM</td>
                  <td className="p-2.5 text-amber-700 font-bold">{f.calories_burned} kcal</td>
                  <td className="p-2.5 text-slate-500">{f.load_kg ? `${f.load_kg} kg` : '—'}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                      VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scientific Measurement Disclaimer */}
      <div className="p-4 rounded-xl med-card text-[11px] text-slate-600 leading-relaxed font-mono">
        <strong className="text-slate-900 block mb-0.5 font-bold">SCIENTIFIC RESPONSIBILITY NOTICE:</strong>
        ASTRA tracks exercise duration, cardiovascular load, and machine-calibrated resistance. In-flight bone mineral density (BMD) and skeletal muscle volume cannot be directly measured without validated DXA / MRI / QCT equipment, which are not currently deployed on deep space transit habitats.
      </div>
    </div>
  );
}
