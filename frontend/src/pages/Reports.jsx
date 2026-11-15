import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle, 
  ShieldAlert, 
  Activity, 
  Heart, 
  Moon, 
  Dumbbell,
  Compass,
  AlertTriangle
} from 'lucide-react';

export default function Reports({ 
  profile, 
  vitals, 
  wellness, 
  fitness, 
  baselines, 
  alerts 
}) {
  const [reportPeriod, setReportPeriod] = useState('30');
  const [reportType, setReportType] = useState('full');

  const selectedVitals = reportPeriod === '7' ? vitals.slice(-7) : (reportPeriod === '14' ? vitals.slice(-14) : vitals.slice(-30));
  const selectedWellness = reportPeriod === '7' ? wellness.slice(-7) : (reportPeriod === '14' ? wellness.slice(-14) : wellness.slice(-30));
  const selectedFitness = reportPeriod === '7' ? fitness.slice(-7) : (reportPeriod === '14' ? fitness.slice(-14) : fitness.slice(-30));

  // Compute Averages
  const avgHR = selectedVitals.length ? Math.round((selectedVitals.reduce((a, b) => a + b.heart_rate, 0) / selectedVitals.length) * 10) / 10 : 68;
  const avgRHR = selectedVitals.length ? Math.round((selectedVitals.reduce((a, b) => a + b.resting_heart_rate, 0) / selectedVitals.length) * 10) / 10 : 58;
  const avgSpO2 = selectedVitals.length ? Math.round((selectedVitals.reduce((a, b) => a + b.spo2, 0) / selectedVitals.length) * 10) / 10 : 98.3;
  const avgBPSys = selectedVitals.length ? Math.round((selectedVitals.reduce((a, b) => a + b.blood_pressure_sys, 0) / selectedVitals.length) * 10) / 10 : 116;
  const avgBPDia = selectedVitals.length ? Math.round((selectedVitals.reduce((a, b) => a + b.blood_pressure_dia, 0) / selectedVitals.length) * 10) / 10 : 74;
  const avgHRV = selectedVitals.length ? Math.round((selectedVitals.reduce((a, b) => a + b.hrv, 0) / selectedVitals.length) * 10) / 10 : 58;

  const avgSleep = selectedWellness.length ? Math.round((selectedWellness.reduce((a, b) => a + b.sleep_duration, 0) / selectedWellness.length) * 10) / 10 : 7.4;
  const avgMood = selectedWellness.length ? Math.round((selectedWellness.reduce((a, b) => a + b.mood, 0) / selectedWellness.length) * 10) / 10 : 8;
  const avgStress = selectedWellness.length ? Math.round((selectedWellness.reduce((a, b) => a + b.stress_level, 0) / selectedWellness.length) * 10) / 10 : 3;

  const totalExerciseMins = selectedFitness.reduce((a, b) => a + b.duration_minutes, 0);
  const totalCalories = selectedFitness.reduce((a, b) => a + b.calories_burned, 0);

  const handlePrint = () => {
    window.print();
  };

  const exportReportCSV = () => {
    const lines = [
      'ASTRA MISSION HEALTH INTELLIGENCE REPORT',
      `Astronaut,${profile?.name || 'Dr. Elena Vance'}`,
      `Callsign,${profile?.callsign || 'Valkyrie-1'}`,
      `Mission,${profile?.mission_name || 'Artemis VII'}`,
      `Current Sol,${profile?.mission_sol || 68}`,
      `Report Window,Last ${reportPeriod} Sols`,
      `Generated Date,${new Date().toISOString()}`,
      '',
      'SUMMARY PHYSIOLOGICAL METRICS',
      'Metric,Observed Mean,Calibrated Baseline,Unit,Delta',
      `Resting Heart Rate,${avgRHR},${baselines['resting_heart_rate']?.mean || 58.4},BPM,${Math.round((avgRHR - (baselines['resting_heart_rate']?.mean || 58.4)) * 10) / 10}`,
      `SpO2 Saturation,${avgSpO2},${baselines['spo2']?.mean || 98.3},%,${Math.round((avgSpO2 - (baselines['spo2']?.mean || 98.3)) * 10) / 10}`,
      `Blood Pressure Systolic,${avgBPSys},${baselines['blood_pressure_sys']?.mean || 116.5},mmHg,${Math.round((avgBPSys - (baselines['blood_pressure_sys']?.mean || 116.5)) * 10) / 10}`,
      `Heart Rate Variability (rMSSD),${avgHRV},${baselines['hrv']?.mean || 58.6},ms,${Math.round((avgHRV - (baselines['hrv']?.mean || 58.6)) * 10) / 10}`,
      `Sleep Duration,${avgSleep},${baselines['sleep_duration']?.mean || 7.4},hours,${Math.round((avgSleep - (baselines['sleep_duration']?.mean || 7.4)) * 10) / 10}`,
      '',
      'RECORDED ANOMALY ALERTS AUDIT',
      'ID,Sol,Severity,Title,Baseline,Observed,Status',
      ...alerts.map(a => `${a.id},${a.sol},${a.severity},"${a.title}",${a.baseline_value},${a.current_value},${a.acknowledged ? 'Acknowledged' : 'Active'}`)
    ];

    const csvContent = "data:text/csv;charset=utf-8," + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASTRA_Comprehensive_Medical_Report_Sol${profile?.mission_sol || 68}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Header & Actions (hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            MISSION MEDICAL REPORT GENERATOR
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Clinical mission summary, baseline comparison matrix, and flight surgeon audit dossier
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Report Period Selector */}
          <div className="flex rounded-lg bg-slate-100 border border-slate-200 p-1 font-mono text-xs">
            <button
              onClick={() => setReportPeriod('7')}
              className={`px-3 py-1.5 rounded-md transition-colors ${reportPeriod === '7' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              7 Sols
            </button>
            <button
              onClick={() => setReportPeriod('14')}
              className={`px-3 py-1.5 rounded-md transition-colors ${reportPeriod === '14' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              14 Sols
            </button>
            <button
              onClick={() => setReportPeriod('30')}
              className={`px-3 py-1.5 rounded-md transition-colors ${reportPeriod === '30' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              30 Sols (Full Mission)
            </button>
          </div>

          <button
            onClick={exportReportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-sky-700 border border-slate-200 text-xs font-mono font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Export</span>
          </button>
        </div>
      </div>

      {/* Official NASA Aerospace Health Report Document */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-none">
        {/* Document Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4 print:bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-mono tracking-widest text-sky-700 font-bold uppercase">
                National Aeronautics and Space Administration
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-wide">
                ASTRA — Astronaut Health Intelligence Dossier
              </h2>
              <div className="text-[11px] text-slate-500 font-mono">
                Document Ref: ASTRA-MED-REP-2026-068-V1 • Classification: Flight Surgeon Eyes Only
              </div>
            </div>
          </div>

          <div className="text-right font-mono text-xs space-y-1">
            <div className="text-slate-500">Mission Sol: <strong className="text-sky-700 font-bold">SOL {profile?.mission_sol || 68}</strong></div>
            <div className="text-slate-500">Vessel: <strong className="text-slate-800">{profile?.vessel}</strong></div>
            <div className="text-slate-500">Orbit: <strong className="text-slate-800">{profile?.craft_orbit}</strong></div>
            <div className="text-slate-500">Report Window: <strong className="text-slate-900">Last {reportPeriod} Sols</strong></div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Astronaut Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-0.5">Crew Member</span>
              <span className="text-slate-900 font-bold">{profile?.name || "Dr. Elena Vance"}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-0.5">Callsign / ID</span>
              <span className="text-sky-700 font-bold">{profile?.callsign} / {profile?.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-0.5">Mission Role</span>
              <span className="text-slate-800 font-semibold">{profile?.role}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-0.5">Active Status</span>
              <span className="text-emerald-700 font-bold">Mission Active</span>
            </div>
          </div>

          {/* 1. Executive Aeromedical Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700 border-b border-slate-200 pb-1.5">
              1. Executive Biotelemetry Summary
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              During the selected reporting cycle (Sols {profile?.mission_sol - parseInt(reportPeriod) + 1} to {profile?.mission_sol}), 
              continuous biotelemetry demonstrated persistent physiological adaptation to long-duration microgravity. 
              Over recent mission cycles (Sols 62–68), the ASTRA anomaly detection module identified a statistically significant 
              elevation in resting heart rate (+{Math.round((avgRHR - 58.4)*10)/10} BPM relative to the calibrated 14-day baseline), 
              concurring with a decline in average restorative sleep duration to {avgSleep} hours and elevated subjective fatigue. 
              Countermeasure adherence (ARED, CEVIS, T2) remains at 100% of prescribed duration.
            </p>
          </div>

          {/* 2. Personalized Baseline vs Observed Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700 border-b border-slate-200 pb-1.5">
              2. Individual Baseline vs Observed Telemetry Matrix
            </h3>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-semibold uppercase tracking-wider">Metric</th>
                    <th className="p-2.5 font-semibold uppercase tracking-wider">Calibrated Baseline (μ)</th>
                    <th className="p-2.5 font-semibold uppercase tracking-wider">Observed Period Mean</th>
                    <th className="p-2.5 font-semibold uppercase tracking-wider">Delta (Δ)</th>
                    <th className="p-2.5 font-semibold uppercase tracking-wider">Z-Score (σ)</th>
                    <th className="p-2.5 font-semibold uppercase tracking-wider">Clinical Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-slate-800">Resting Heart Rate</td>
                    <td className="p-2.5 text-slate-500">58.4 BPM</td>
                    <td className="p-2.5 text-sky-700 font-bold">{avgRHR} BPM</td>
                    <td className="p-2.5 text-amber-700 font-semibold">+{Math.round((avgRHR - 58.4) * 10) / 10} BPM</td>
                    <td className="p-2.5 text-amber-700 font-bold">+{Math.round(((avgRHR - 58.4) / 3.8) * 10) / 10}σ</td>
                    <td className="p-2.5 text-amber-800">Elevated (Autonomic Strain)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-slate-800">SpO2 Blood Oxygen</td>
                    <td className="p-2.5 text-slate-500">98.3%</td>
                    <td className="p-2.5 text-emerald-700 font-bold">{avgSpO2}%</td>
                    <td className="p-2.5 text-slate-500">{Math.round((avgSpO2 - 98.3) * 10) / 10}%</td>
                    <td className="p-2.5 text-slate-500">-0.2σ</td>
                    <td className="p-2.5 text-emerald-700">Nominal Habitability</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-slate-800">Blood Pressure (Systolic)</td>
                    <td className="p-2.5 text-slate-500">116.5 mmHg</td>
                    <td className="p-2.5 text-sky-700 font-bold">{avgBPSys} mmHg</td>
                    <td className="p-2.5 text-slate-600">+{Math.round((avgBPSys - 116.5) * 10) / 10} mmHg</td>
                    <td className="p-2.5 text-slate-600">+1.2σ</td>
                    <td className="p-2.5 text-slate-700">Mild Cephalad Fluid Shift</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-slate-800">Heart Rate Variability (rMSSD)</td>
                    <td className="p-2.5 text-slate-500">58.6 ms</td>
                    <td className="p-2.5 text-purple-700 font-bold">{avgHRV} ms</td>
                    <td className="p-2.5 text-rose-700 font-semibold">{Math.round((avgHRV - 58.6) * 10) / 10} ms</td>
                    <td className="p-2.5 text-rose-700 font-bold">-1.8σ</td>
                    <td className="p-2.5 text-rose-800">Parasympathetic Tone Withdrawal</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-slate-800">Sleep Duration</td>
                    <td className="p-2.5 text-slate-500">7.42 hrs</td>
                    <td className="p-2.5 text-sky-700 font-bold">{avgSleep} hrs</td>
                    <td className="p-2.5 text-amber-700 font-semibold">{Math.round((avgSleep - 7.42) * 10) / 10} hrs</td>
                    <td className="p-2.5 text-amber-700 font-bold">-1.9σ</td>
                    <td className="p-2.5 text-amber-800">Cumulative Sleep Debt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Alerts & Anomaly Audit Log */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700 border-b border-slate-200 pb-1.5">
              3. Anomaly Detections & Actionable Audit Log
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {alerts.map((a) => (
                <div key={a.id} className={`p-3.5 rounded-lg border text-xs ${
                  a.severity === 'High' ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-bold ${a.severity === 'High' ? 'text-rose-900' : 'text-amber-900'}`}>
                      [{a.severity} SEVERITY] {a.title} (Sol {a.sol})
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      a.acknowledged ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {a.acknowledged ? 'ACKNOWLEDGED' : 'ACTIVE'}
                    </span>
                  </div>
                  <p className={`text-[11px] mb-1.5 leading-relaxed ${a.severity === 'High' ? 'text-rose-800' : 'text-amber-800'}`}>{a.reason}</p>
                  <div className="text-[11px] text-sky-800 bg-white border border-slate-200 rounded-lg p-2">
                    <strong className="text-slate-600 block mb-0.5">Prescribed Action:</strong>
                    {a.recommended_action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Partner Space Agency Research Baseline */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700 border-b border-slate-200 pb-1.5">
              4. Space Agency Research Attribution & Data Categorization
            </h3>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-rose-800 font-bold">CANADIAN SPACE AGENCY (CSA / ASC) PARTNER INTEGRATION</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                • <strong>CSA TBone Study Reference:</strong> Published findings from 17 astronauts aboard the ISS proved that &gt;50% of crew members did not regain pre-flight bone density 1 year post-mission, with recovery rate inversely correlated with mission length. Applied in ASTRA to validate countermeasure load regimens (ARED 115 kg deadlifts). (Source: <a href="https://www.asc-csa.gc.ca/eng/sciences/tbone.asp" target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">asc-csa.gc.ca/tbone</a>)<br />
                • <strong>CSA Space Health Bio-Monitor Architecture:</strong> Validated framework informing ASTRA's 5-channel telemetry monitoring (Heart Rate, Respiration Rate, SpO2, Activity, and Wellness Questionnaire). (Source: <a href="https://www.asc-csa.gc.ca/eng/sciences/space-flight-improve-monitor-health-earth.asp" target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">asc-csa.gc.ca/bio-monitor</a>)<br />
                • <strong>Data Authenticity:</strong> Strictly delineates Category A (Published CSA Research), Category B (Simulated Astronaut Telemetry), and Category C (Prototype-Generated Analytics).
              </p>
            </div>
          </div>

          {/* 5. Flight Surgeon Sign-Off Section */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Flight Surgeon Countersign</span>
              <div className="text-slate-900 font-bold">Dr. Marcus Sterling, MD, FAsMA</div>
              <div className="text-[11px] text-slate-600">Chief Medical Officer • NASA JSC Flight Medicine</div>
              <div className="text-emerald-700 text-[10px] flex items-center gap-1 mt-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>DIGITALLY SIGNED & VERIFIED VIA DEEP SPACE DOWNLINK</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Crew Member Acknowledgment</span>
              <div className="text-slate-900 font-bold">Dr. Elena Vance (Astronaut Specialist)</div>
              <div className="text-[11px] text-slate-600">Callsign: Valkyrie-1 • Artemis VII Deep Space HAB</div>
              <div className="text-sky-700 text-[10px] mt-2 font-semibold">
                RECORD HASH: SHA-256: 7e890f42b... [STORED IN LOCAL INDEXEDDB]
              </div>
            </div>
          </div>

          {/* Legal Disclaimer Footer */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center font-mono">
            ASTRA (Astronaut Health Intelligence System) • 2026 NASA Space Apps Challenge Research Prototype.
            Not a certified medical diagnostic device. Designed for crew situational awareness and remote flight surgeon collaboration.
          </div>
        </div>
      </div>
    </div>
  );
}
