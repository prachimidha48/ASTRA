import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  BrainCircuit, 
  Moon, 
  Dumbbell, 
  History, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Wifi,
  WifiOff,
  RefreshCw,
  Compass,
  Globe
} from 'lucide-react';

export default function Sidebar({ 
  currentPage, 
  setCurrentPage, 
  collapsed, 
  setCollapsed, 
  connectionStatus, 
  pendingSyncCount,
  onSyncNow
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'vitals', label: 'Vital Signs', icon: Activity },
    { id: 'intelligence', label: 'Health Intelligence', icon: BrainCircuit, badge: 'AI/ML' },
    { id: 'wellness', label: 'Mental & Sleep', icon: Moon },
    { id: 'fitness', label: 'Physical Fitness', icon: Dumbbell },
    { id: 'research', label: 'Space Agency Research', icon: Globe, badge: 'CSA' },
    { id: 'history', label: 'Health History', icon: History },
    { id: 'reports', label: 'Medical Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`relative flex flex-col justify-between border-r border-slate-200 bg-white transition-all duration-300 z-30 shadow-xs ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 shrink-0 shadow-xs">
              <Compass className="w-6 h-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-sky-500"></div>
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-widest text-lg text-slate-900">ASTRA</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 font-semibold">
                    NASA 2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 tracking-wider uppercase font-medium">
                  Health Intelligence
                </p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Mission Status Pill */}
        {!collapsed ? (
          <div className="mx-3 my-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500 font-medium">MISSION SOL</span>
              <span className="font-mono text-sky-700 font-bold">SOL 68 / 180</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-sky-600 h-full w-[37.7%]"></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
              <span className="font-semibold text-slate-700">ARTEMIS VII</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                ACTIVE
              </span>
            </div>
          </div>
        ) : (
          <div className="my-3 flex justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-mono text-[10px] font-bold text-sky-700" title="Sol 68 / 180">
              68
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 border-l-4 border-sky-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    item.badge === 'CSA'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-sky-100 text-sky-700 border border-sky-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Connection & Medical Disclaimer */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {/* Offline & Sync Status Pill */}
        <div className={`p-2.5 rounded-lg border text-xs ${
          connectionStatus === 'ONLINE'
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2">
              {connectionStatus === 'ONLINE' ? (
                <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              {!collapsed && (
                <span className="font-mono text-[11px] font-semibold">
                  {connectionStatus === 'ONLINE' ? 'TELEMETRY ONLINE' : 'ORBITAL OFFLINE'}
                </span>
              )}
            </div>

            {!collapsed && pendingSyncCount > 0 && (
              <button 
                onClick={onSyncNow}
                className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-700 text-white font-bold transition-colors shadow-xs"
                title="Sync queued biotelemetry records to Earth/Gateway"
              >
                <RefreshCw className="w-3 h-3" />
                SYNC ({pendingSyncCount})
              </button>
            )}
          </div>
          {!collapsed && (
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              IndexedDB local storage active
            </div>
          )}
        </div>

        {/* Prototype Regulatory Notice */}
        {!collapsed && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-tight">
            <span className="text-slate-800 font-semibold block mb-0.5">RESEARCH PROTOTYPE</span>
            NASA Space Apps Challenge. Non-diagnostic biotelemetry awareness system.
          </div>
        )}
      </div>
    </aside>
  );
}
