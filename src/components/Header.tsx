import React from 'react';
import {
  ShieldCheck,
  Database,
  Search,
  Activity,
  FileCode,
  History,
  Share2,
  Sun,
  Moon,
  FileText
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className={`border-b sticky top-0 z-40 no-print transition-colors ${
      isDark
        ? 'border-slate-800/80 bg-slate-950/95 text-slate-100 backdrop-blur-md'
        : 'border-slate-200 bg-white/95 text-slate-900 backdrop-blur-md shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-700/80 text-blue-400'
                : 'bg-slate-100 border-slate-300 text-blue-700 shadow-xs'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight">
                  SENTINELA PLD/KYT
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                  isDark
                    ? 'bg-slate-900 text-slate-400 border-slate-800'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  BACEN 3.978
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Sistema de Compliance & Investigação de Vínculos
              </p>
            </div>
          </div>

          {/* Right Controls: Badges + Theme Toggle + Report Button */}
          <div className="flex items-center space-x-3">
            {/* Status pills (sober) */}
            <div className="hidden lg:flex items-center space-x-2 text-xs">
              <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>BrasilAPI</span>
              </div>

              <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>CGU (CEIS/CNEP)</span>
              </div>

              <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>MySQL {systemStatus?.database?.configured ? 'Ativo' : 'Pronto'}</span>
              </div>
            </div>

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema claro e escuro"
              title={isDark ? 'Mudar para Versão Clara' : 'Mudar para Versão Escura'}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-slate-300">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline text-slate-700">Modo Escuro</span>
                </>
              )}
            </button>

            {/* Export Dossier button */}
            {canExportReport && (
              <button
                onClick={onOpenReport}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500/30'
                    : 'bg-blue-700 hover:bg-blue-800 text-white border-blue-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                <span>Dossiê PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Sober, Institutional) */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => setActiveTab('attribution')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'attribution'
                ? isDark
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Grafo & Atribuição PLD</span>
          </button>

          <button
            onClick={() => setActiveTab('screening')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'screening'
                ? isDark
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Varredura 360° (CNPJ/CPF)</span>
          </button>

          <button
            onClick={() => setActiveTab('kyt')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'kyt'
                ? isDark
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Monitor KYT (Transações)</span>
          </button>

          <button
            onClick={() => setActiveTab('mysql')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'mysql'
                ? isDark
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Banco de Dados MySQL & ETL</span>
          </button>

          <button
            onClick={() => setActiveTab('code_analyzer')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'code_analyzer'
                ? isDark
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Análise do Seu Código</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? isDark
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Trilha de Auditoria</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
