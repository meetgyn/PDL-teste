import React from 'react';
import { ShieldCheck, Database, Search, Activity, FileCode, History, CheckCircle2, AlertTriangle, Share2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: {
    status?: string;
    database?: { host: string; database: string; configured: boolean };
  } | null;
  onOpenReport?: () => void;
  canExportReport?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  onOpenReport,
  canExportReport
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  SENTINELA PLD/KYT
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  BACEN 3.978 / COAF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sistema Integrado de Compliance, Triagem e Banco de Dados MySQL
              </p>
            </div>
          </div>

          {/* Real-time Status Badges */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium">BrasilAPI & QSA</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-medium">CGU (CEIS/CNEP)</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-medium">OFAC / OpenSanctions</span>
            </div>

            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border ${
              systemStatus?.database?.configured
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <Database className="w-3.5 h-3.5" />
              <span className="font-medium">
                MySQL: {systemStatus?.database?.configured ? 'Conectado' : 'Pronto p/ Conexão'}
              </span>
            </div>
          </div>

          {/* Action button */}
          {canExportReport && (
            <button
              onClick={onOpenReport}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all border border-blue-400/30 cursor-pointer"
            >
              Exportar Dossiê PDF
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('attribution')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'attribution'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Share2 className="w-4 h-4 text-pink-400" />
            <span>Grafo & Atribuição PLD</span>
            <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold">
              Seu MVP
            </span>
          </button>

          <button
            onClick={() => setActiveTab('screening')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'screening'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Varredura 360° (CNPJ/CPF)</span>
          </button>

          <button
            onClick={() => setActiveTab('kyt')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'kyt'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Monitor KYT (Transações)</span>
          </button>

          <button
            onClick={() => setActiveTab('mysql')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'mysql'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Banco de Dados MySQL & ETL</span>
          </button>

          <button
            onClick={() => setActiveTab('code_analyzer')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'code_analyzer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Análise do Seu Código / Scripts</span>
            <span className="ml-1 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded font-semibold border border-amber-500/30">
              Novo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Trilha de Auditoria</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
