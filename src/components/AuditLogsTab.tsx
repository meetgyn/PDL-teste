import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Lock,
  RefreshCw
} from 'lucide-react';
import { AuditRecord } from '../types/pld';

export const AuditLogsTab: React.FC = () => {
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
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'ALTO':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIO':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Exigência Regulatória Circular BACEN 3.978 / COAF</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Trilha de Auditoria & Não-Repúdio
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Registro imutável de todas as consultas, varreduras cadastrais e transações analisadas, com identificação do operador, fontes pesquisadas e resultado da matriz de risco. Prazo de guarda obrigatório: <strong>5 anos</strong>.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Control Bar: Filters, Search, and Export */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, documento pesquisado ou analista..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 text-xs focus:outline-none"
            >
              <option value="ALL">Todos os Níveis de Risco</option>
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
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Atualizar registros"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Trilha (.JSON)</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">ID Auditoria</th>
                <th className="p-3.5">Data / Hora</th>
                <th className="p-3.5">Tipo / Alvo</th>
                <th className="p-3.5">Score / Risco</th>
                <th className="p-3.5">Bandeiras & Ocorrências</th>
                <th className="p-3.5">Operador / Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhum registro encontrado para os critérios selecionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-300">{log.id}</td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                          {log.targetType}
                        </span>
                        <span className="font-bold text-white font-mono">{log.targetValue}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white">{log.riskScore}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(
                            log.riskLevel
                          )}`}
                        >
                          {log.riskLevel}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      {log.flags && log.flags.length > 0 ? (
                        <div className="space-y-1">
                          {log.flags.slice(0, 2).map((f, i) => (
                            <span
                              key={i}
                              className="block truncate text-slate-300 text-[11px]"
                              title={f}
                            >
                              • {f}
                            </span>
                          ))}
                          {log.flags.length > 2 && (
                            <span className="text-[10px] text-slate-500">
                              +{log.flags.length - 2} apontamentos adicionais
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-emerald-400 text-[11px] flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Sem restrições</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-300 block font-medium">{log.operator}</span>
                      <span className="text-slate-500 text-[11px]">{log.source}</span>
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
