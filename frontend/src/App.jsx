import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LogModal from './components/LogModal';

import Overview from './pages/Overview';
import VitalSigns from './pages/VitalSigns';
import HealthIntelligence from './pages/HealthIntelligence';
import MentalWellness from './pages/MentalWellness';
import PhysicalFitness from './pages/PhysicalFitness';
import SpaceAgencyResearch from './pages/SpaceAgencyResearch';
import HealthHistory from './pages/HealthHistory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import { 
  getAstronautProfile, 
  getVitals, 
  getWellness, 
  getFitness, 
  getBaselines, 
  getAlerts,
  getPendingSyncCount,
  syncPendingQueue,
  subscribeConnectionStatus,
  isOffline,
  setSimulatedOffline
} from './services/api';

import { Compass } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [profile, setProfile] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [wellness, setWellness] = useState([]);
  const [fitness, setFitness] = useState([]);
  const [baselines, setBaselines] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [rangeView, setRangeView] = useState('7d');

  // Connection & Offline States
  const [connectionStatus, setConnectionStatus] = useState(isOffline() ? 'OFFLINE' : 'ONLINE');
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Load all telemetry
  const loadData = useCallback(async () => {
    try {
      const [profData, vitData, welData, fitData, baseData, alertData, pendingCount] = await Promise.all([
        getAstronautProfile(),
        getVitals(rangeView),
        getWellness(30),
        getFitness(30),
        getBaselines(),
        getAlerts(),
        getPendingSyncCount()
      ]);

      setProfile(profData);
      setVitals(vitData);
      setWellness(welData);
      setFitness(fitData);
      setBaselines(baseData);
      setAlerts(alertData);
      setPendingSyncCount(pendingCount);
    } catch (err) {
      console.error("Error loading ASTRA telemetry:", err);
    } finally {
      setLoading(false);
    }
  }, [rangeView]);

  useEffect(() => {
    loadData();

    const unsubscribe = subscribeConnectionStatus((status) => {
      setConnectionStatus(status);
    });

    return () => unsubscribe();
  }, [loadData]);

  // Sync action triggered from sidebar or header
  const handleSyncNow = async () => {
    try {
      await syncPendingQueue();
      await loadData();
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  const handleToggleOfflineMode = () => {
    const currentlyOffline = isOffline();
    setSimulatedOffline(!currentlyOffline);
    setConnectionStatus(!currentlyOffline ? 'OFFLINE' : 'ONLINE');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 mb-4 shadow-sm">
          <Compass className="w-10 h-10 animate-spin" />
        </div>
        <div className="font-mono text-base font-bold tracking-widest text-slate-900">ASTRA TELEMETRY NODE</div>
        <div className="text-xs text-slate-500 font-mono mt-1">Connecting to BioTelemetry Subsystems & Local IndexedDB...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* 1. Collapsible Professional Clinical Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        connectionStatus={connectionStatus}
        pendingSyncCount={pendingSyncCount}
        onSyncNow={handleSyncNow}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Dynamic Header with telemetry alerts and clock */}
        <Header
          profile={profile}
          activeAlerts={alerts}
          onOpenLogModal={() => setIsLogModalOpen(true)}
          connectionStatus={connectionStatus}
          toggleOfflineMode={handleToggleOfflineMode}
          pendingSyncCount={pendingSyncCount}
          onNavigateToIntelligence={() => setCurrentPage('intelligence')}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {currentPage === 'overview' && (
            <Overview
              profile={profile}
              vitals={vitals}
              wellness={wellness}
              fitness={fitness}
              baselines={baselines}
              alerts={alerts}
              rangeView={rangeView}
              setRangeView={setRangeView}
              onNavigateToIntelligence={() => setCurrentPage('intelligence')}
              onNavigateToVitals={() => setCurrentPage('vitals')}
              onOpenLogModal={() => setIsLogModalOpen(true)}
            />
          )}

          {currentPage === 'vitals' && (
            <VitalSigns
              vitals={vitals}
              baselines={baselines}
              onOpenLogModal={() => setIsLogModalOpen(true)}
            />
          )}

          {currentPage === 'intelligence' && (
            <HealthIntelligence
              baselines={baselines}
              alerts={alerts}
              vitals={vitals}
              wellness={wellness}
              onRefreshData={loadData}
            />
          )}

          {currentPage === 'wellness' && (
            <MentalWellness
              wellness={wellness}
              baselines={baselines}
              onRefreshData={loadData}
              currentSol={profile?.mission_sol || 68}
            />
          )}

          {currentPage === 'fitness' && (
            <PhysicalFitness
              fitness={fitness}
              onOpenLogModal={() => setIsLogModalOpen(true)}
              onNavigateToResearch={() => setCurrentPage('research')}
            />
          )}

          {currentPage === 'research' && (
            <SpaceAgencyResearch />
          )}

          {currentPage === 'history' && (
            <HealthHistory
              vitals={vitals}
              wellness={wellness}
              fitness={fitness}
              alerts={alerts}
            />
          )}

          {currentPage === 'reports' && (
            <Reports
              profile={profile}
              vitals={vitals}
              wellness={wellness}
              fitness={fitness}
              baselines={baselines}
              alerts={alerts}
            />
          )}

          {currentPage === 'settings' && (
            <Settings
              profile={profile}
              baselines={baselines}
              connectionStatus={connectionStatus}
              onRefreshData={loadData}
            />
          )}
        </main>
      </div>

      {/* 3. Global Data Entry Modal */}
      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        baselines={baselines}
        onDataLogged={loadData}
        currentSol={profile?.mission_sol || 68}
      />
    </div>
  );
}
