import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScreeningTab } from './components/ScreeningTab';
import { AttributionGraphTab } from './components/AttributionGraphTab';
import { KytMonitorTab } from './components/KytMonitorTab';
import { DatabaseSchemaTab } from './components/DatabaseSchemaTab';
import { CodeAnalyzerTab } from './components/CodeAnalyzerTab';
import { AuditLogsTab } from './components/AuditLogsTab';
import { ComplianceReportModal } from './components/ComplianceReportModal';
import { CompanyData, EvaluationResult } from './types/pld';
import { Shield, Sparkles, Database, FileCheck } from 'lucide-react';

export default function App() {
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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
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
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>
              Sentinela PLD/KYT Compliance Suite • Suporte a MySQL, BrasilAPI, CGU, TSE, OFAC e ONU
            </span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span>Circular BACEN 3.978</span>
            <span>•</span>
            <span>Lei 9.613/98 (Antilavagem)</span>
            <span>•</span>
            <span>GAFI / FATF 40 Recomendações</span>
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
