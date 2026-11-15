import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  PlusCircle, 
  Clock, 
  Radio, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function Header({ 
  profile, 
  activeAlerts, 
  onOpenLogModal, 
  connectionStatus, 
  toggleOfflineMode, 
  onNavigateToIntelligence
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unackAlerts = activeAlerts.filter(a => !a.acknowledged);
  const criticalAlert = unackAlerts.find(a => a.severity === 'High') || unackAlerts[0];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-20 shadow-xs">
      {/* Top telemetry bar */}
      <div className="px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Vessel & Mission Telemetry */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-600"></span>
            </span>
            <div className="font-mono text-xs">
              <span className="text-slate-500 font-medium">VESSEL: </span>
              <span className="text-slate-900 font-bold">{profile?.vessel || "Gateway HAB-4"}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 font-mono text-xs text-slate-500 border-l border-slate-200 pl-4">
            <span className="font-medium">ORBIT: </span>
            <span className="text-sky-800 font-semibold">{profile?.craft_orbit || "NRHO (Lunar Gateway)"}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 font-mono text-xs text-slate-500 border-l border-slate-200 pl-4">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="font-medium">DOWNLINK DELAY: </span>
            <span className="text-slate-800 font-semibold">1.28s (Lunar Range)</span>
          </div>
        </div>

        {/* Right: Clock, Offline Simulator, Log Action, Astronaut Avatar */}
        <div className="flex items-center gap-3">
          {/* Mission Elapsed Time (MET) + UTC */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-slate-500 font-medium">MET:</span>
            <span className="text-slate-900 font-bold">
              068:14:{String(currentTime.getMinutes()).padStart(2, '0')}:{String(currentTime.getSeconds()).padStart(2, '0')}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">{currentTime.toUTCString().slice(17, 25)} UTC</span>
          </div>

          {/* Offline Mode Simulator Toggle */}
          <button
            onClick={toggleOfflineMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors shadow-2xs ${
              connectionStatus === 'ONLINE'
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
            title="Toggle between Ground Downlink and Spacecraft Isolation Mode (IndexedDB)"
          >
            {connectionStatus === 'ONLINE' ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Ground Linked</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulated Offline</span>
              </>
            )}
          </button>

          {/* Quick Log Button */}
          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Telemetry</span>
          </button>

          {/* Astronaut Profile Avatar & Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <img 
              src={profile?.avatar_url || "./avatar.svg"} 
              alt={profile?.name || "Astronaut"}
              className="w-8 h-8 rounded-full border border-sky-300 object-cover shadow-2xs"
            />
            <div className="hidden xl:block text-left text-xs leading-none">
              <div className="font-bold text-slate-900">{profile?.name || "Dr. Elena Vance"}</div>
              <div className="text-[10px] text-sky-700 font-mono font-semibold mt-0.5">{profile?.callsign || "Valkyrie-1"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Anomaly Alert Ribbon if unacknowledged alert */}
      {criticalAlert && (
        <div 
          onClick={onNavigateToIntelligence}
          className={`px-6 py-2.5 flex items-center justify-between text-xs font-mono cursor-pointer transition-colors border-t ${
            criticalAlert.severity === 'High'
              ? 'bg-rose-50 border-rose-200 text-rose-950 hover:bg-rose-100'
              : 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className={`w-4 h-4 shrink-0 ${
              criticalAlert.severity === 'High' ? 'text-rose-600 animate-bounce' : 'text-amber-600'
            }`} />
            <div>
              <span className="font-bold uppercase tracking-wider">
                [{criticalAlert.severity} PRIORITY HEALTH ANOMALY]:
              </span>{' '}
              <span className="font-semibold">{criticalAlert.title}</span>
              <span className="text-slate-600 hidden md:inline ml-2">
                — {criticalAlert.reason.slice(0, 110)}...
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-sky-700 font-sans font-bold hover:underline">
            <span>View Clinical Protocol</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </header>
  );
}
