import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { AuditRecord } from '../types/pld';
import { useTheme } from '../context/ThemeContext';

export const AuditLogsTab: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.targetValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = filterLevel === 'ALL' || log.riskLevel === filterLevel;

    return matchesSearch && matchesLevel;
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICO':
        return isDark ? 'bg-rose-950/40 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-800 border-rose-200';
      case 'ALTO':
        return isDark ? 'bg-amber-950/40 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-800 border-amber-200';
      case 'MEDIO':
        return isDark ? 'bg-yellow-950/40 text-yellow-300 border-yellow-800' : 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trilha_auditoria_pld_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const cardClass = isDark
    ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  const inputClass = isDark
    ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`border rounded-xl p-5 relative overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="max-w-3xl relative z-10">
          <div className="flex items-center space-x-2 text-xs font-semibold mb-2">
            <span className={`px-2 py-0.5 rounded border ${
              isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              Circular BACEN 3.978
            </span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Guarda Obrigatória por 5 Anos
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Trilha de Auditoria & Não-Repúdio
          </h1>
          <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Registro imutável de todas as consultas, triagens cadastrais e transações analisadas, com identificação do operador, fontes consultadas e parecer regulatório.
          </p>
        </div>
      </div>

      {/* Control Bar: Filters, Search, and Export */}
      <div className={`border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 ${cardClass}`}>
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, documento ou analista..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs border ${inputClass}`}
            />
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border ${inputClass}`}
            >
              <option value="ALL">Todos os Níveis</option>
              <option value="CRITICO">Apenas CRÍTICO</option>
              <option value="ALTO">Apenas ALTO</option>
              <option value="MEDIO">Apenas MÉDIO</option>
              <option value="BAIXO">Apenas BAIXO</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className={`p-1.5 rounded-lg border text-slate-400 hover:text-slate-200 transition-all cursor-pointer ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}
            title="Atualizar registros"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportJson}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar (.JSON)</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className={`border rounded-xl shadow-xs overflow-hidden ${cardClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`font-semibold border-b ${
              isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <tr>
                <th className="p-3">ID Auditoria</th>
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Tipo / Alvo</th>
                <th className="p-3">Score / Risco</th>
                <th className="p-3">Apontamentos</th>
                <th className="p-3">Operador</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    Nenhum registro encontrado para os critérios selecionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                    <td className="p-3 font-mono font-bold">{log.id}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${
                          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                        }`}>
                          {log.targetType}
                        </span>
                        <span className="font-mono font-semibold">{log.targetValue}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold">{log.riskScore}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(log.riskLevel)}`}>
                          {log.riskLevel}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 max-w-xs">
                      {log.flags && log.flags.length > 0 ? (
                        <div className="space-y-0.5">
                          {log.flags.slice(0, 2).map((f, i) => (
                            <span key={i} className="block truncate text-[11px] text-slate-400">
                              • {f}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-emerald-500 text-[11px] flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Sem restrições</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400">
                      {log.operator}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
