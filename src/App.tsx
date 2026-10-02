import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { ScreeningTab } from './components/ScreeningTab';
import { AttributionGraphTab } from './components/AttributionGraphTab';
import { KytMonitorTab } from './components/KytMonitorTab';
import { DatabaseSchemaTab } from './components/DatabaseSchemaTab';
import { CodeAnalyzerTab } from './components/CodeAnalyzerTab';
import { AuditLogsTab } from './components/AuditLogsTab';
import { ComplianceReportModal } from './components/ComplianceReportModal';
import { CompanyData, EvaluationResult } from './types/pld';
import { Shield } from 'lucide-react';

function MainApp() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<string>('attribution');
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // Stored dossier for report export
  const [lastDossier, setLastDossier] = useState<{
    company: CompanyData;
    evaluation: EvaluationResult;
  } | null>(null);

  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setSystemStatus(data);
    } catch (e) {
      console.warn('Backend not responding yet or offline:', e);
    }
  };

  const handleEvaluationComplete = (data: { company: CompanyData; evaluation: EvaluationResult }) => {
    setLastDossier(data);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isDark
        ? 'bg-[#080d1a] text-slate-100 selection:bg-blue-600 selection:text-white'
        : 'bg-[#f8fafc] text-slate-900 selection:bg-slate-900 selection:text-white'
    }`}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        onOpenReport={() => setIsReportOpen(true)}
        canExportReport={Boolean(lastDossier)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'attribution' && <AttributionGraphTab />}

        {activeTab === 'screening' && (
          <ScreeningTab
            onEvaluationComplete={handleEvaluationComplete}
            onOpenReport={() => setIsReportOpen(true)}
          />
        )}

        {activeTab === 'kyt' && <KytMonitorTab />}

        {activeTab === 'mysql' && <DatabaseSchemaTab />}

        {activeTab === 'code_analyzer' && <CodeAnalyzerTab />}

        {activeTab === 'audit' && <AuditLogsTab />}
      </main>

      {/* Footer */}
      <footer className={`border-t py-5 text-xs no-print transition-colors ${
        isDark
          ? 'border-slate-800/80 bg-slate-950/80 text-slate-500'
          : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>
              Sentinela PLD/KYT Compliance Suite • MySQL, BrasilAPI, CGU, TSE, OFAC e ONU
            </span>
          </div>

          <div className="flex items-center space-x-4 opacity-75">
            <span>Circular BACEN 3.978</span>
            <span>•</span>
            <span>Lei 9.613/98 (Antilavagem)</span>
            <span>•</span>
            <span>GAFI / FATF</span>
          </div>
        </div>
      </footer>

      {/* Compliance Report Modal */}
      <ComplianceReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        data={lastDossier}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
