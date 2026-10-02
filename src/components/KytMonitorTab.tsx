import React, { useState } from 'react';
import {
  Activity,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Sliders
} from 'lucide-react';
import { KytTransaction } from '../types/pld';
import { useTheme } from '../context/ThemeContext';

export const KytMonitorTab: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Form inputs
  const [txId, setTxId] = useState(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
  const [origemDoc, setOrigemDoc] = useState('33.000.167/0001-01');
  const [origemNome, setOrigemNome] = useState('PETROLEO BRASILEIRO S A');
  const [destinoDoc, setDestinoDoc] = useState('04.123.456/0001-78');
  const [destinoNome, setDestinoNome] = useState('DELTA ENGENHARIA E CONSTRUCOES LTDA');
  const [valor, setValor] = useState('9850');
  const [metodoPagamento, setMetodoPagamento] = useState<'PIX' | 'TED' | 'CRIPTO' | 'ESPECIE' | 'BOLETO'>('PIX');
  const [horario, setHorario] = useState('23:45');
  const [paisDestino, setPaisDestino] = useState('BR');
  const [mediaMensal, setMediaMensal] = useState('15000');

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Initial monitored feed
  const [transactionsFeed, setTransactionsFeed] = useState<KytTransaction[]>([
    {
      id: 'TX-781923',
      dataHora: '2026-10-01 11:20:15',
      origemDoc: '12.345.678/0001-90',
      origemNome: 'COMERCIAL ALIMENTOS LTDA',
      destinoDoc: '98.765.432/0001-11',
      destinoNome: 'DISTRIBUIDORA NORTE SA',
      valor: 14500.00,
      metodoPagamento: 'TED',
      scoreRisco: 12,
      status: 'LIBERADA',
      regrasVioladas: []
    },
    {
      id: 'TX-781924',
      dataHora: '2026-10-01 12:05:40',
      origemDoc: '45.123.789/0001-55',
      origemNome: 'CONSTRUTORA HORIZONTE LTDA',
      destinoDoc: '04.123.456/0001-78',
      destinoNome: 'DELTA ENGENHARIA E CONSTRUCOES',
      valor: 85000.00,
      metodoPagamento: 'ESPECIE',
      scoreRisco: 88,
      status: 'BLOQUEADA',
      siscoafMandatory: true,
      regrasVioladas: [
        { code: 'R-BACEN-01', rule: 'Operação em espécie >= R$ 50.000,00 (Comunicação compulsória ao COAF)', weight: 50, severity: 'CRITICO' },
        { code: 'R-SANCTIONED-PARTY', rule: 'Contraparte associada a sanção ativa no CNEP (CGU)', weight: 50, severity: 'CRITICO' }
      ]
    },
    {
      id: 'TX-781925',
      dataHora: '2026-10-01 12:30:11',
      origemDoc: '***.456.789-**',
      origemNome: 'CARLOS ALBERTO SILVA SANTOS',
      destinoDoc: 'WALLET-BTC-892',
      destinoNome: 'VASP OFFSHORE CARIBE',
      valor: 49200.00,
      metodoPagamento: 'CRIPTO',
      paisDestino: 'PANAMA',
      scoreRisco: 76,
      status: 'EM_ANALISE_MANUAL',
      regrasVioladas: [
        { code: 'R-SMURFING', rule: 'Indício de estruturação logo abaixo da trava de R$ 50.000,00', weight: 40, severity: 'GRAVE' },
        { code: 'R-JURISDICTION', rule: 'Remessa para jurisdição com regime fiscal favorecido', weight: 45, severity: 'CRITICO' }
      ]
    }
  ]);

  // Presets
  const kytPresets = [
    {
      label: 'Caso 1: Fracionamento / Smurfing (PIX R$ 9.850)',
      data: {
        valor: '9850',
        metodo: 'PIX' as const,
        horario: '23:45',
        origemNome: 'INVESTIMENTOS RAPIDOS LTDA',
        destinoNome: 'DELTA ENGENHARIA (Sancionada)',
        destinoDoc: '04.123.456/0001-78',
        pais: 'BR',
        media: '15000'
      }
    },
    {
      label: 'Caso 2: Operação em Espécie R$ 75.000 (Reporte COAF)',
      data: {
        valor: '75000',
        metodo: 'ESPECIE' as const,
        horario: '14:20',
        origemNome: 'JOALHERIA CENTRAL LTDA',
        destinoNome: 'SAQUE CONTA CORRENTE',
        destinoDoc: '***.888.777-**',
        pais: 'BR',
        media: '20000'
      }
    },
    {
      label: 'Caso 3: Cripto / Remessa Offshore (Panamá)',
      data: {
        valor: '120000',
        metodo: 'CRIPTO' as const,
        horario: '03:15',
        origemNome: 'HOLDING INTERNACIONAL EIRELI',
        destinoNome: 'PANAMA GLOBAL SETTLEMENT',
        destinoDoc: 'PA-9988221',
        pais: 'PANAMA',
        media: '10000'
      }
    },
    {
      label: 'Caso 4: Transação Regular (Fornecedor R$ 3.200)',
      data: {
        valor: '3200',
        metodo: 'TED' as const,
        horario: '10:30',
        origemNome: 'PADARIA E CONFEITARIA LTDA',
        destinoNome: 'MOINHO PAULISTA SA',
        destinoDoc: '60.409.075/0001-52',
        pais: 'BR',
        media: '40000'
      }
    }
  ];

  const applyPreset = (preset: typeof kytPresets[0]) => {
    setTxId(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
    setValor(preset.data.valor);
    setMetodoPagamento(preset.data.metodo);
    setHorario(preset.data.horario);
    setOrigemNome(preset.data.origemNome);
    setDestinoNome(preset.data.destinoNome);
    setDestinoDoc(preset.data.destinoDoc);
    setPaisDestino(preset.data.pais);
    setMediaMensal(preset.data.media);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/kyt/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txId,
          origemDoc,
          origemNome,
          destinoDoc,
          destinoNome,
          valor: parseFloat(valor) || 0,
          metodoPagamento,
          horario,
          paisDestino,
          historicoCliente: {
            mediaMensal: parseFloat(mediaMensal) || 15000
          }
        })
      });

      const data = await response.json();
      setAnalysisResult(data);

      const newTx: KytTransaction = {
        id: data.txId,
        dataHora: new Date().toLocaleString('pt-BR'),
        origemDoc,
        origemNome,
        destinoDoc,
        destinoNome,
        valor: parseFloat(valor) || 0,
        metodoPagamento,
        paisDestino,
        scoreRisco: data.riskScore,
        status: data.status,
        regrasVioladas: data.triggeredRules,
        siscoafMandatory: data.siscoafMandatory
      };

      setTransactionsFeed(prev => [newTx, ...prev.slice(0, 9)]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsReported = (id: string) => {
    setTransactionsFeed(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'REPORTADA_COAF' } : t))
    );
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
              Monitoramento Transacional
            </span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Circular BACEN 3.978 / COAF
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Know Your Transaction (KYT) em Tempo Real
          </h1>
          <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Monitoramento de operações atípicas (PIX, TED, Criptoativos, Espécie), detecção de 
            <strong> fracionamento (smurfing)</strong> e geração de comunicações ao <strong>SISCOAF / COAF</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transaction Input Form */}
        <div className={`lg:col-span-5 border rounded-xl p-5 space-y-4 ${cardClass}`}>
          <div className={`flex items-center justify-between border-b pb-3 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Simulador de Transação
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">{txId}</span>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1.5">
              Cenários Pré-configurados:
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {kytPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className={`px-3 py-1.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isDark
                      ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="truncate">{p.label}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-slate-500 block mb-1 font-medium">Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">R$</span>
                  <input
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className={`w-full pl-8 pr-2.5 py-1.5 rounded-lg font-mono font-bold border ${inputClass}`}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">Meio de Pagamento</label>
                <select
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value as any)}
                  className={`w-full px-2.5 py-1.5 rounded-lg border ${inputClass}`}
                >
                  <option value="PIX">PIX Instantâneo</option>
                  <option value="TED">TED Bancária</option>
                  <option value="CRIPTO">Criptoativos / VASP</option>
                  <option value="ESPECIE">Espécie (Dinheiro Vivo)</option>
                  <option value="BOLETO">Boleto Bancário</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-slate-500 block mb-1 font-medium">Horário da Operação</label>
                <input
                  type="time"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg border ${inputClass}`}
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">País de Destino</label>
                <input
                  type="text"
                  value={paisDestino}
                  onChange={(e) => setPaisDestino(e.target.value)}
                  placeholder="BR, PANAMA, CAYMAN..."
                  className={`w-full px-2.5 py-1.5 rounded-lg uppercase border ${inputClass}`}
                />
              </div>
            </div>

            <div className={`pt-2 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block text-[11px] mb-0.5">Origem (Nome / Doc)</label>
                  <input
                    type="text"
                    value={origemNome}
                    onChange={(e) => setOrigemNome(e.target.value)}
                    className={`w-full px-2 py-1 rounded text-xs mb-1 border ${inputClass}`}
                  />
                  <input
                    type="text"
                    value={origemDoc}
                    onChange={(e) => setOrigemDoc(e.target.value)}
                    className={`w-full px-2 py-0.5 rounded font-mono text-[11px] border ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[11px] mb-0.5">Destino (Nome / Doc)</label>
                  <input
                    type="text"
                    value={destinoNome}
                    onChange={(e) => setDestinoNome(e.target.value)}
                    className={`w-full px-2 py-1 rounded text-xs mb-1 border ${inputClass}`}
                  />
                  <input
                    type="text"
                    value={destinoDoc}
                    onChange={(e) => setDestinoDoc(e.target.value)}
                    className={`w-full px-2 py-0.5 rounded font-mono text-[11px] border ${inputClass}`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1 font-medium">
                Média Mensal Histórica do Emissor (R$)
              </label>
              <input
                type="number"
                value={mediaMensal}
                onChange={(e) => setMediaMensal(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg font-mono border ${inputClass}`}
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-2.5 font-semibold rounded-lg text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 ${
              isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Processar Análise KYT</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Instant Evaluation Card */}
        <div className="lg:col-span-7 space-y-6">
          {analysisResult ? (
            <div className={`border rounded-xl p-5 space-y-4 animate-in fade-in ${cardClass}`}>
              <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: {analysisResult.txId}
                  </span>
                  <h3 className="text-base font-bold mt-0.5">
                    Avaliação Regulatória da Transação
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                      analysisResult.status === 'BLOQUEADA'
                        ? isDark ? 'bg-rose-950/40 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-800 border-rose-200'
                        : analysisResult.status === 'EM_ANALISE_MANUAL'
                        ? isDark ? 'bg-amber-950/40 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-800 border-amber-200'
                        : isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    STATUS: {analysisResult.status}
                  </span>

                  {analysisResult.siscoafMandatory && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold">
                      REPORTE COAF
                    </span>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg border ${subCardClass}`}>
                  <span className="text-xs text-slate-500 block mb-1">Score de Risco KYT</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold font-mono">{analysisResult.riskScore}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${subCardClass}`}>
                  <span className="text-xs text-slate-500 block mb-1">Valor Monitorado</span>
                  <span className="text-base font-bold font-mono">
                    {Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className={`p-3 rounded-lg border ${subCardClass}`}>
                  <span className="text-xs text-slate-500 block mb-1">Regras Disparadas</span>
                  <span className="text-base font-bold font-mono">
                    {analysisResult.triggeredRules.length} violações
                  </span>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Violações Identificadas:</span>
                </h4>

                {analysisResult.triggeredRules.length === 0 ? (
                  <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
                    isDark ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Nenhum desvio atípico detectado no perfil transacional.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {analysisResult.triggeredRules.map((rule: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border flex items-start justify-between text-xs space-x-2 ${subCardClass}`}
                      >
                        <div>
                          <span className="font-mono font-bold mr-2">[{rule.code}]</span>
                          <span className="text-slate-300">{rule.rule}</span>
                        </div>
                        <span className="font-mono font-bold text-rose-400 whitespace-nowrap">
                          +{rule.weight} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SISCOAF Dispatch */}
              {analysisResult.siscoafMandatory && (
                <div className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-rose-950/20 border-rose-800 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div>
                    <span className="text-xs font-bold block">
                      Comunicação ao COAF Obrigatória
                    </span>
                    <span className="text-[11px] opacity-80">
                      Operação enquadrada no art. 11 da Lei 9.613/98 e Circular 3.978.
                    </span>
                  </div>
                  <button
                    onClick={() => markAsReported(analysisResult.txId)}
                    className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                  >
                    Registrar SISCOAF
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={`border rounded-xl p-8 text-center space-y-2 ${cardClass}`}>
              <Activity className="w-8 h-8 mx-auto text-slate-400" />
              <h3 className="text-sm font-bold">Nenhuma transação analisada</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Selecione um cenário ou preencha os dados e clique em "Processar Análise KYT" para simular o motor.
              </p>
            </div>
          )}

          {/* Transactions Feed */}
          <div className={`border rounded-xl p-5 space-y-3 ${cardClass}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Transações Recentes Monitoradas
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {transactionsFeed.length} registradas
              </span>
            </div>

            <div className="space-y-2">
              {transactionsFeed.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-3 rounded-lg border text-xs space-y-1.5 ${subCardClass}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="font-bold">{tx.id}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] border border-slate-700">
                        {tx.metodoPagamento}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold">
                        {tx.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        tx.status === 'BLOQUEADA'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : tx.status === 'EM_ANALISE_MANUAL'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="truncate max-w-[200px]">{tx.origemNome}</span>
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mx-2" />
                    <span className="truncate max-w-[200px] text-right">{tx.destinoNome}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
