import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  Send,
  Flag,
  RotateCcw,
  Zap,
  Globe,
  Sliders
} from 'lucide-react';
import { KytTransaction } from '../types/pld';

export const KytMonitorTab: React.FC = () => {
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
        { code: 'R-SMURFING', rule: 'Indício clássico de estruturação logo abaixo do limite de R$ 50.000,00', weight: 40, severity: 'GRAVE' },
        { code: 'R-JURISDICTION', rule: 'Remessa direcionada a jurisdição de alto risco ou paraíso fiscal', weight: 45, severity: 'CRITICO' }
      ]
    }
  ]);

  // Presets for quick simulation
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

      // Prepend to feed
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Motor de Monitoramento Contínuo KYT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Know Your Transaction (KYT) em Tempo Real
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Avalie cada movimentação financeira (PIX, TED, Criptoativos, Espécie) em busca de 
            <strong> fracionamento (smurfing)</strong>, <strong>valores atípicos</strong>, 
            <strong> paraísos fiscais</strong> e contrapartes em listas restritivas, gerando comunicações automáticas ao <strong>SISCOAF / COAF</strong> conforme a <strong>Circular BACEN 3.978</strong>.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transaction Input Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Simulador de Transação
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">{txId}</span>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-2">
              Cenários Típicos de Fraude & Lavagem:
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {kytPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{p.label}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Valor da Operação (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">R$</span>
                  <input
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Meio de Pagamento</label>
                <select
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="PIX">PIX Instantâneo</option>
                  <option value="TED">TED Bancária</option>
                  <option value="CRIPTO">Ativos Virtuais / Cripto</option>
                  <option value="ESPECIE">Espécie (Dinheiro Vivo)</option>
                  <option value="BOLETO">Boleto Cobrança</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Horário da Execução</label>
                <input
                  type="time"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">País de Destino</label>
                <input
                  type="text"
                  value={paisDestino}
                  onChange={(e) => setPaisDestino(e.target.value)}
                  placeholder="BR, PANAMA, CAYMAN..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Partes Envolvidas:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block mb-0.5">Origem (Nome / Doc)</label>
                  <input
                    type="text"
                    value={origemNome}
                    onChange={(e) => setOrigemNome(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs mb-1"
                  />
                  <input
                    type="text"
                    value={origemDoc}
                    onChange={(e) => setOrigemDoc(e.target.value)}
                    className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-slate-400 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-0.5">Destino (Nome / Doc)</label>
                  <input
                    type="text"
                    value={destinoNome}
                    onChange={(e) => setDestinoNome(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs mb-1"
                  />
                  <input
                    type="text"
                    value={destinoDoc}
                    onChange={(e) => setDestinoDoc(e.target.value)}
                    className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-slate-400 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Faturamento Médio Mensal do Emissor (R$)
              </label>
              <input
                type="number"
                value={mediaMensal}
                onChange={(e) => setMediaMensal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Processar Análise KYT</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Instant Evaluation Card */}
        <div className="lg:col-span-7 space-y-6">
          {analysisResult ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-400 font-mono">
                    ID Transação: {analysisResult.txId}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Resultado da Análise Regulatória
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${
                      analysisResult.status === 'BLOQUEADA'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : analysisResult.status === 'EM_ANALISE_MANUAL'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    STATUS: {analysisResult.status}
                  </span>

                  {analysisResult.siscoafMandatory && (
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold animate-pulse">
                      REPORTE COAF OBRIGATÓRIO
                    </span>
                  )}
                </div>
              </div>

              {/* Score Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Score de Risco KYT</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-white font-mono">
                      {analysisResult.riskScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">Valor Monitorado</span>
                  <span className="text-xl font-bold text-white font-mono">
                    {Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">Regras Disparadas</span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    {analysisResult.triggeredRules.length} violações
                  </span>
                </div>
              </div>

              {/* Triggered Rules list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Violações Identificadas pelas Regras de Compliance:</span>
                </h4>

                {analysisResult.triggeredRules.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Nenhum padrão atípico detectado. Transação compatível com o perfil.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analysisResult.triggeredRules.map((rule: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between text-xs space-x-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-blue-400 text-[11px]">
                              [{rule.code}]
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                rule.severity === 'CRITICO'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {rule.severity}
                            </span>
                          </div>
                          <p className="text-slate-200">{rule.rule}</p>
                        </div>
                        <span className="text-rose-400 font-mono font-bold flex-shrink-0">
                          +{rule.weight} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action: SISCOAF Dispatch */}
              {analysisResult.siscoafMandatory && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-purple-300 block">
                      Comunicação de Operação Suspeita (SISCOAF)
                    </span>
                    <span className="text-[11px] text-purple-200/80">
                      Geração de arquivo XML padronizado para envio ao Conselho de Controle de Atividades Financeiras.
                    </span>
                  </div>
                  <button
                    onClick={() => markAsReported(analysisResult.txId)}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer whitespace-nowrap"
                  >
                    Transmitir ao SISCOAF
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Nenhuma transação analisada no momento</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Selecione um dos cenários típicos à esquerda ou preencha os dados e clique em "Processar Análise KYT" para simular a esteira antilavagem em tempo real.
              </p>
            </div>
          )}

          {/* Transactions Live Feed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Esteira Recente de Transações Monitoradas
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {transactionsFeed.length} registradas
              </span>
            </div>

            <div className="space-y-2.5">
              {transactionsFeed.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all text-xs space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-300">{tx.id}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                        {tx.metodoPagamento}
                      </span>
                      {tx.paisDestino && tx.paisDestino !== 'BR' && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] flex items-center space-x-1">
                          <Globe className="w-2.5 h-2.5" />
                          <span>{tx.paisDestino}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white text-sm">
                        {tx.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'BLOQUEADA'
                            ? 'bg-rose-500/20 text-rose-400'
                            : tx.status === 'EM_ANALISE_MANUAL'
                            ? 'bg-amber-500/20 text-amber-400'
                            : tx.status === 'REPORTADA_COAF'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="truncate max-w-[200px]">{tx.origemNome}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0 mx-2" />
                    <span className="truncate max-w-[200px] text-right">{tx.destinoNome}</span>
                  </div>

                  {tx.regrasVioladas.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                      {tx.regrasVioladas.map((r, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 text-[10px] border border-rose-800/40"
                        >
                          {r.code}: {r.rule.slice(0, 45)}...
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
