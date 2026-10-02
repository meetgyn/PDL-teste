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
  Scale,
  Landmark
} from 'lucide-react';
import { CompanyData, EvaluationResult } from '../types/pld';
import { useTheme } from '../context/ThemeContext';

interface ScreeningTabProps {
  onEvaluationComplete?: (data: { company: CompanyData; evaluation: EvaluationResult }) => void;
  onOpenReport?: () => void;
}

export const ScreeningTab: React.FC<ScreeningTabProps> = ({
  onEvaluationComplete,
  onOpenReport
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    { label: 'BCB DASFN: Banpará (04.913.711/0001-08)', value: '04.913.711/0001-08', type: 'cnpj' },
    { label: 'BCB DASFN: Banco Votorantim BV (59.588.111/0001-03)', value: '59.588.111/0001-03', type: 'cnpj' },
    { label: 'Exemplo 1: Regular (Petrobras)', value: '33.000.167/0001-01', type: 'cnpj' },
    { label: 'Exemplo 2: Sancionada CNEP/CGU (Fraude)', value: '04.123.456/0001-78', type: 'cnpj' },
    { label: 'Exemplo 3: Inidônea CEIS / TCU', value: '12.987.654/0001-32', type: 'cnpj' },
    { label: 'Exemplo 4: PEP & Doações TSE', value: 'FERNANDO DIAS OLIVEIRA', type: 'person' },
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
        return isDark
          ? 'text-rose-400 bg-rose-950/40 border-rose-800'
          : 'text-rose-800 bg-rose-50 border-rose-200';
      case 'ALTO':
        return isDark
          ? 'text-amber-400 bg-amber-950/40 border-amber-800'
          : 'text-amber-800 bg-amber-50 border-amber-200';
      case 'MEDIO':
        return isDark
          ? 'text-yellow-400 bg-yellow-950/40 border-yellow-800'
          : 'text-yellow-800 bg-yellow-50 border-yellow-200';
      default:
        return isDark
          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800'
          : 'text-emerald-800 bg-emerald-50 border-emerald-200';
    }
  };

  const cardClass = isDark
    ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  const subCardClass = isDark
    ? 'bg-slate-950/80 border-slate-800 text-slate-200'
    : 'bg-slate-50 border-slate-200 text-slate-800';

  const inputClass = isDark
    ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400';

  return (
    <div className="space-y-6">
      {/* Top Banner (Sober Executive Styling) */}
      <div className={`border rounded-xl p-5 relative overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="max-w-3xl relative z-10">
          <div className="flex items-center space-x-2 text-xs font-semibold mb-2">
            <span className={`px-2 py-0.5 rounded border ${
              isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              Triagem Automatizada
            </span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Conformidade Regulamentar BACEN / COAF
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Varredura Cadastral 360° (CNPJ & CPF)
          </h1>
          <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Consulte a <strong>Receita Federal (BrasilAPI/QSA)</strong>, <strong>Portal da Transparência (CEIS/CNEP)</strong>, 
            <strong> PEPs</strong>, <strong>TSE (doações)</strong> e <strong>OFAC/ONU</strong> com matriz de risco e trilha de auditoria.
          </p>
        </div>
      </div>

      {/* Search Bar & Type Selector */}
      <div className={`border rounded-xl p-5 ${cardClass}`}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => {
              setQueryType('cnpj');
              setSearchTerm('');
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              queryType === 'cnpj'
                ? isDark
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Pessoa Jurídica (CNPJ)</span>
          </button>

          <button
            onClick={() => {
              setQueryType('person');
              setSearchTerm('');
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              queryType === 'person'
                ? isDark
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Pessoa Física (CPF ou Nome)</span>
          </button>
        </div>

        {/* Input box */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                queryType === 'cnpj'
                  ? 'Digite o CNPJ (ex: 33.000.167/0001-01 ou apenas números)...'
                  : 'Digite o Nome Completo ou CPF da pessoa física...'
              }
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border ${inputClass}`}
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className={`px-5 py-2.5 text-xs font-semibold rounded-lg text-white transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 ${
              isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Consultando...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Pesquisar</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Test Presets */}
        <div className={`mt-4 pt-3 border-t text-xs ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <span className={`font-medium block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Exemplos Rápidos:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center space-x-1 cursor-pointer border ${
                  isDark
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <span>{preset.label}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-4 rounded-xl border text-xs flex items-start space-x-3 ${
          isDark ? 'bg-rose-950/20 border-rose-800/50 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <AlertOctagon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Erro no processamento</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Results for CNPJ */}
      {companyResult && evaluationResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Data */}
            <div className={`lg:col-span-2 border rounded-xl p-6 space-y-4 ${cardClass}`}>
              <div className={`flex flex-wrap items-start justify-between gap-3 border-b pb-4 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div>
                  <span className={`text-xs font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    CNPJ: {companyResult.cnpj_formatado || companyResult.cnpj}
                  </span>
                  <h2 className="text-lg font-bold mt-0.5">
                    {companyResult.razao_social}
                  </h2>
                  {companyResult.nome_fantasia && (
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Nome Fantasia: {companyResult.nome_fantasia}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                      companyResult.situacao_cadastral === 'ATIVA'
                        ? isDark ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isDark ? 'bg-rose-950/30 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {companyResult.situacao_cadastral}
                  </span>
                  {onOpenReport && (
                    <button
                      onClick={onOpenReport}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Dossiê PDF</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid with attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-lg border ${subCardClass}`}>
                  <div className="flex items-center space-x-2 mb-1 text-slate-500">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="font-medium">CNAE Principal</span>
                  </div>
                  <span className="font-semibold block">
                    {companyResult.cnae_fiscal} - {companyResult.cnae_fiscal_descricao || 'Não informado'}
                  </span>
                </div>

                <div className={`p-3 rounded-lg border ${subCardClass}`}>
                  <div className="flex items-center space-x-2 mb-1 text-slate-500">
                    <Coins className="w-3.5 h-3.5" />
                    <span className="font-medium">Capital Social</span>
                  </div>
                  <span className="font-semibold font-mono block">
                    {Number(companyResult.capital_social || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </span>
                </div>

                <div className={`p-3 rounded-lg border ${subCardClass}`}>
                  <div className="flex items-center space-x-2 mb-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">Início da Atividade</span>
                  </div>
                  <span className="font-semibold block">
                    {companyResult.data_inicio_atividade || 'Não registrado'}
                  </span>
                </div>

                <div className={`p-3 rounded-lg border ${subCardClass}`}>
                  <div className="flex items-center space-x-2 mb-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-medium">Localização</span>
                  </div>
                  <span className="font-semibold block">
                    {[companyResult.logradouro, companyResult.numero, companyResult.municipio, companyResult.uf]
                      .filter(Boolean)
                      .join(', ') || 'Brasil'}
                  </span>
                </div>
              </div>

              {/* Banco Central do Brasil - DASFN / SFN Validation */}
              {companyResult.bcbDasfn?.isRegulatedSfn && (
                <div className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                  isDark ? 'bg-blue-950/20 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center space-x-1.5">
                      <Landmark className="w-3.5 h-3.5 text-blue-400" />
                      <span>Instituição Autorizada & Regulada pelo Banco Central (SFN / DASFN)</span>
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">
                      ISPB: {companyResult.bcbDasfn.data?.ispb || 'N/A'} • Segmento: {companyResult.bcbDasfn.data?.segmento || 'SFN'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90">
                    Tipo: <strong>{companyResult.bcbDasfn.data?.tipo}</strong> | Situação: <strong>{companyResult.bcbDasfn.data?.situacao}</strong>
                  </p>
                  {companyResult.bcbDasfn.data?.datasetUrl && (
                    <div className="text-[10px] pt-1 border-t border-blue-800/30 font-mono text-slate-400">
                      Catálogo BCB: {companyResult.bcbDasfn.data.datasetUrl}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Risk Gauge */}
            <div className={`border rounded-xl p-6 flex flex-col justify-between ${cardClass}`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Score de Risco PLD
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getRiskColor(evaluationResult.riskLevel)}`}>
                    RISCO {evaluationResult.riskLevel}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold font-mono">
                      {evaluationResult.riskScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>

                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                      className={`h-full ${
                        evaluationResult.riskScore >= 70
                          ? 'bg-rose-500'
                          : evaluationResult.riskScore >= 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${evaluationResult.riskScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className={`mt-5 p-3.5 rounded-lg border ${subCardClass}`}>
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Parecer Regulatório:
                  </span>
                  <p className="text-xs font-semibold leading-relaxed">
                    {evaluationResult.recommendation}
                  </p>
                </div>
              </div>

              <div className={`mt-4 pt-3 border-t text-[11px] text-slate-500 flex justify-between ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <span>Protocolo: {evaluationResult.auditLogId}</span>
                <span>BACEN 3.978</span>
              </div>
            </div>
          </div>

          {/* Risk Alerts */}
          {evaluationResult.flags.length > 0 && (
            <div className={`border rounded-xl p-5 ${cardClass}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Apontamentos & Bandeiras de Risco ({evaluationResult.flags.length})</span>
              </h3>
              <div className="space-y-2">
                {evaluationResult.flags.map((flag, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex items-start space-x-2.5 ${subCardClass}`}
                  >
                    <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QSA Partners */}
          <div className={`border rounded-xl p-5 space-y-4 ${cardClass}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold">
                  Quadro Societário & Beneficiários Finais (QSA / UBO)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {(companyResult.qsa || []).length} Sócios
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(companyResult.qsa || []).map((partner, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border space-y-2 ${subCardClass}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold">
                        {partner.nome_socio || partner.nome || 'SÓCIO'}
                      </h4>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {partner.qualificacao_socio || partner.qualificacao_representante_legal || 'Sócio'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      {partner.isPep && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold">
                          PEP
                        </span>
                      )}
                      {partner.hasSanction && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/30 text-[10px] font-bold">
                          SANÇÃO
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono flex justify-between">
                    <span>Doc: {partner.cnpj_cpf_do_socio || '***'}</span>
                    <span>{partner.faixa_etaria || 'Idade regular'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sanctions Section */}
          <div className={`border rounded-xl p-5 space-y-3 ${cardClass}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold">
                  Auditoria de Sanções (CEIS, CNEP, OFAC, ONU)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {evaluationResult.sanctionsFound.length === 0 ? 'Sem ocorrências impeditivas' : `${evaluationResult.sanctionsFound.length} Sanções Ativas`}
              </span>
            </div>

            {evaluationResult.sanctionsFound.length === 0 ? (
              <div className={`p-3.5 rounded-lg border text-xs flex items-center space-x-2 ${
                isDark ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Nenhuma sanção restritiva em vigor identificada nas bases da CGU ou listas internacionais.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {evaluationResult.sanctionsFound.map((sanc, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                      isDark ? 'bg-rose-950/20 border-rose-800 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{sanc.cadastro} - {sanc.orgaoSancionador}</span>
                      <span className="font-mono text-[10px]">Até {sanc.dataFim || 'Indeterminado'}</span>
                    </div>
                    <p className="opacity-90">{sanc.motivo}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results for Person */}
      {personResult && (
        <div className={`border rounded-xl p-6 space-y-4 animate-in fade-in ${cardClass}`}>
          <div className={`border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <span className="text-xs font-mono uppercase text-slate-500">Triagem de Pessoa Física</span>
            <h2 className="text-xl font-bold mt-0.5">{personResult.query}</h2>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-500">Ocorrências Localizadas:</h4>
            {personResult.matches.length === 0 ? (
              <div className={`p-3 rounded-lg border flex items-center space-x-2 ${
                isDark ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <CheckCircle className="w-4 h-4" />
                <span>Nenhuma sanção restritiva ou impedimento cadastrado.</span>
              </div>
            ) : (
              personResult.matches.map((match: any, idx: number) => (
                <div key={idx} className={`p-3 rounded-lg border ${subCardClass}`}>
                  <span className="font-bold block">{match.cadastro} - {match.orgaoSancionador}</span>
                  <p className="mt-1">{match.motivo}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
