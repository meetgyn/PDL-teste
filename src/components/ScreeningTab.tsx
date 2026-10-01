import React, { useState } from 'react';
import {
  Search,
  Building2,
  UserCheck,
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  FileText,
  Users,
  Coins,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Flame,
  Scale,
  Landmark
} from 'lucide-react';
import { CompanyData, EvaluationResult } from '../types/pld';

interface ScreeningTabProps {
  onEvaluationComplete?: (data: { company: CompanyData; evaluation: EvaluationResult }) => void;
  onOpenReport?: () => void;
}

export const ScreeningTab: React.FC<ScreeningTabProps> = ({
  onEvaluationComplete,
  onOpenReport
}) => {
  const [queryType, setQueryType] = useState<'cnpj' | 'person'>('cnpj');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [companyResult, setCompanyResult] = useState<CompanyData | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [personResult, setPersonResult] = useState<any | null>(null);

  // Test presets
  const presets = [
    { label: 'Exemplo 1: Empresa Regular (Petrobras)', value: '33.000.167/0001-01', type: 'cnpj' },
    { label: 'Exemplo 2: Sancionada CNEP/CGU (Fraude)', value: '04.123.456/0001-78', type: 'cnpj' },
    { label: 'Exemplo 3: Inidônea CEIS / TCU', value: '12.987.654/0001-32', type: 'cnpj' },
    { label: 'Exemplo 4: Pessoa PEP & Doações TSE', value: 'FERNANDO DIAS OLIVEIRA', type: 'person' },
    { label: 'Exemplo 5: Investigado OFAC SDN', value: 'CARLOS ALBERTO SILVA SANTOS', type: 'person' }
  ];

  const handleSearch = async (termToSearch?: string, explicitType?: 'cnpj' | 'person') => {
    const term = termToSearch !== undefined ? termToSearch : searchTerm;
    const type = explicitType || queryType;

    if (!term.trim()) {
      setError('Por favor, informe um CNPJ, CPF ou Nome para realizar a busca.');
      return;
    }

    setLoading(true);
    setError(null);
    setCompanyResult(null);
    setEvaluationResult(null);
    setPersonResult(null);

    try {
      if (type === 'cnpj') {
        const clean = term.replace(/\D/g, '');
        const response = await fetch(`/api/screening/cnpj/${clean}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao consultar CNPJ');
        }

        setCompanyResult(data.company);
        setEvaluationResult(data.evaluation);
        if (onEvaluationComplete) {
          onEvaluationComplete(data);
        }
      } else {
        const isDoc = /\d{6,}/.test(term);
        const response = await fetch('/api/screening/person', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: isDoc ? '' : term,
            document: isDoc ? term : ''
          })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao consultar pessoa');
        }

        setPersonResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Falha na conexão com os serviços de triagem.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setQueryType(preset.type as any);
    setSearchTerm(preset.value);
    handleSearch(preset.value, preset.type as any);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICO':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'ALTO':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MEDIO':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getRiskProgressColor = (score: number) => {
    if (score >= 75) return 'from-rose-600 to-red-500';
    if (score >= 50) return 'from-orange-500 to-amber-500';
    if (score >= 25) return 'from-yellow-500 to-lime-500';
    return 'from-emerald-500 to-teal-400';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Guidance */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Flame className="w-3.5 h-3.5 text-blue-400" />
            <span>Motor Unificado de Triagem PLD/CFT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Varredura 360° de Pessoas Jurídicas e Físicas
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Consulte instantaneamente a <strong>Receita Federal (BrasilAPI/QSA)</strong>, <strong>Portal da Transparência (CEIS/CNEP/CEPIM)</strong>, 
            <strong> PEPs nacionais</strong>, <strong>TSE (doações de campanha)</strong> e <strong>listas globais (OFAC/ONU)</strong>, com cálculo automatizado da matriz de risco e geração de dossiê de auditoria.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      </div>

      {/* Search Bar & Type Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => {
              setQueryType('cnpj');
              setSearchTerm('');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              queryType === 'cnpj'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Pessoa Jurídica (CNPJ)</span>
          </button>

          <button
            onClick={() => {
              setQueryType('person');
              setSearchTerm('');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              queryType === 'person'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Pessoa Física (CPF ou Nome)</span>
          </button>
        </div>

        {/* Input box */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                queryType === 'cnpj'
                  ? 'Digite o CNPJ (ex: 00.000.000/0001-91 ou apenas números)...'
                  : 'Digite o Nome Completo ou CPF da pessoa física...'
              }
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Executar Screening</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Test Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800/70">
          <span className="text-xs text-slate-400 font-medium block mb-2">
            Casos de Teste Rápidos (Clique para simular):
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>{preset.label}</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-start space-x-3">
          <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Erro no processamento</p>
            <p className="text-rose-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Results for CNPJ */}
      {companyResult && evaluationResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Summary Card: Company Info + Risk Score Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Basic Data */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    CNPJ: {companyResult.cnpj_formatado || companyResult.cnpj}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {companyResult.razao_social}
                  </h2>
                  {companyResult.nome_fantasia && (
                    <p className="text-sm text-slate-400">
                      Nome Fantasia: {companyResult.nome_fantasia}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      companyResult.situacao_cadastral === 'ATIVA'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {companyResult.situacao_cadastral}
                  </span>
                  {onOpenReport && (
                    <button
                      onClick={onOpenReport}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Dossiê Completo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid with attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <Layers className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-medium block">CNAE Principal</span>
                    <span className="text-slate-200 font-semibold">
                      {companyResult.cnae_fiscal} - {companyResult.cnae_fiscal_descricao || 'Não informado'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <Coins className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-medium block">Capital Social</span>
                    <span className="text-slate-200 font-semibold font-mono">
                      {Number(companyResult.capital_social || 0).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-medium block">Início da Atividade</span>
                    <span className="text-slate-200 font-semibold">
                      {companyResult.data_inicio_atividade || 'Não registrado'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-medium block">Localização</span>
                    <span className="text-slate-200 font-semibold">
                      {[companyResult.logradouro, companyResult.numero, companyResult.municipio, companyResult.uf]
                        .filter(Boolean)
                        .join(', ') || 'Brasil'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Gauge & Recommendation */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Score de Risco PLD/CFT
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskColor(
                      evaluationResult.riskLevel
                    )}`}
                  >
                    RISCO {evaluationResult.riskLevel}
                  </span>
                </div>

                {/* Score Number and Bar */}
                <div className="space-y-3">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-black text-white font-mono tracking-tight">
                      {evaluationResult.riskScore}
                    </span>
                    <span className="text-sm text-slate-400 font-semibold">/ 100</span>
                  </div>

                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getRiskProgressColor(
                        evaluationResult.riskScore
                      )} transition-all duration-500`}
                      style={{ width: `${evaluationResult.riskScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Recommendation box */}
                <div className="mt-5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Parecer Regulatório de Compliance:
                  </span>
                  <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                    {evaluationResult.recommendation}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Auditoria: {evaluationResult.auditLogId}</span>
                <span>Algoritmo: GAFI / Circular 3.978</span>
              </div>
            </div>
          </div>

          {/* Risk Alerts & Red Flags list */}
          {evaluationResult.flags.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Apontamentos & Bandeiras de Atenção Identificadas ({evaluationResult.flags.length})</span>
              </h3>
              <div className="space-y-2.5">
                {evaluationResult.flags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QSA - Quadro de Sócios e Administradores (UBO) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Quadro Societário & Beneficiários Finais (QSA / UBO)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {(companyResult.qsa || []).length} Sócios Registrados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(companyResult.qsa || []).map((partner, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {partner.nome_socio || partner.nome || 'SÓCIO NÃO IDENTIFICADO'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {partner.qualificacao_socio || partner.qualificacao_representante_legal || 'Sócio'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                      {partner.isPep ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-bold">
                          PEP
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">
                          Não PEP
                        </span>
                      )}

                      {partner.hasSanction ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                          SANCIONADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
                          Sem Sanção
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Doc: {partner.cnpj_cpf_do_socio || '***'}</span>
                    <span>{partner.faixa_etaria || 'Idade regular'}</span>
                  </div>

                  {partner.pepDetails && partner.pepDetails.length > 0 && (
                    <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-200">
                      <strong>Exposição Política:</strong> {partner.pepDetails[0]?.motivo}
                    </div>
                  )}

                  {partner.sanctions && partner.sanctions.length > 0 && (
                    <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-200">
                      <strong>Sanção Ativa:</strong> {partner.sanctions[0]?.cadastro} ({partner.sanctions[0]?.orgaoSancionador})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Restrictive Lists & Sanctions Deep Dive */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Auditoria de Sanções e Listas Restritivas (CEIS, CNEP, OFAC, ONU)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {evaluationResult.sanctionsFound.length === 0 ? 'Nenhuma sanção encontrada' : `${evaluationResult.sanctionsFound.length} Sanções Ativas`}
              </span>
            </div>

            {evaluationResult.sanctionsFound.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Consulta concluída com sucesso no Cadastro Nacional de Empresas Inidôneas e Suspensas (CEIS), Cadastro Nacional de Empresas Punidas (CNEP) e listas globais. Nenhuma sanção restritiva em vigor.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {evaluationResult.sanctionsFound.map((sanc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300 text-sm">
                        {sanc.cadastro} - {sanc.orgaoSancionador}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">
                        Ativa até {sanc.dataFim || 'Indeterminado'}
                      </span>
                    </div>
                    <p className="text-slate-300">
                      <strong>Motivo / Dispositivo:</strong> {sanc.motivo}
                    </p>
                    {sanc.valorMulta && (
                      <p className="text-amber-400 font-mono">
                        Multa Aplicada: {sanc.valorMulta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results for Person (Individual) */}
      {personResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Triagem de Pessoa Física
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {personResult.query}
                </h2>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ocorrências e Registros Localizados ({personResult.matches.length}):
                </h4>
                {personResult.matches.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Nenhuma sanção, processo impeditivo ou cadastro de PEP encontrado para esta pessoa.</span>
                  </div>
                ) : (
                  personResult.matches.map((match: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          {match.cadastro} - {match.orgaoSancionador}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                          Doc: {match.documento}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {match.motivo}
                      </p>
                      {match.mandato && (
                        <p className="text-purple-400">Mandato / Exercício: {match.mandato}</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* TSE Contributions */}
              {personResult.tseContributions && personResult.tseContributions.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Landmark className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Registro de Doações Eleitorais (Dados Abertos do TSE):
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {personResult.tseContributions.map((tse: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white">
                            Ano {tse.ano} - {tse.candidato} ({tse.partido})
                          </span>
                          <span className="text-slate-400 block text-[11px]">
                            Cargo: {tse.cargo} | {tse.tipo}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">
                          {Number(tse.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Risk Gauge */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Score de Risco Individual
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskColor(
                      personResult.riskLevel
                    )}`}
                  >
                    RISCO {personResult.riskLevel}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-black text-white font-mono tracking-tight">
                      {personResult.riskScore}
                    </span>
                    <span className="text-sm text-slate-400 font-semibold">/ 100</span>
                  </div>

                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getRiskProgressColor(
                        personResult.riskScore
                      )} transition-all duration-500`}
                      style={{ width: `${personResult.riskScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Diretriz de Conformidade:
                  </span>
                  <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                    {personResult.riskLevel === 'CRITICO' || personResult.riskLevel === 'ALTO'
                      ? 'Requer aprovação de Diretor / Comitê de Compliance e justificativa documental formal.'
                      : 'Cadastro liberado sem impedimentos regulatórios.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                Registro de Auditoria: {personResult.auditLogId}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
