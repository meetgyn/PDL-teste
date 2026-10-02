import React, { useState, useRef } from 'react';
import {
  Play,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  ArrowRight,
  Database,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NodeData {
  id: string;
  type: 'root' | 'company' | 'asset' | 'risk';
  label: string;
  tag: string;
  confidence: string;
  desc: string;
  x: number;
  y: number;
}

export const AttributionGraphTab: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [subView, setSubView] = useState<'start' | 'case' | 'graph' | 'paths' | 'evidence' | 'report' | 'api'>('start');

  // Input fields
  const [entityType, setEntityType] = useState<'PF' | 'PJ'>('PJ');
  const [entityName, setEntityName] = useState('DELTA ENGENHARIA E CONSTRUCOES LTDA');
  const [docNumber, setDocNumber] = useState('04.123.456/0001-78');
  const [investigationContext, setInvestigationContext] = useState('PLD / AML');
  const [isRunning, setIsRunning] = useState(false);

  // Pipeline state
  const [activeStage, setActiveStage] = useState(0);
  const [logs, setLogs] = useState<Array<{ text: string; type: 'ok' | 'hit' | 'info' }>>([]);
  const [discoveries, setDiscoveries] = useState<Array<{ stage: string; text: string; hit: boolean }>>([]);

  // Case metrics
  const [pldRisk] = useState(86);
  const [attributionConfidence] = useState(92);
  const [evidenceConfidence] = useState(89);

  // Graph state
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [zoom, setZoom] = useState(1);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  // Initial nodes
  const [nodes, setNodes] = useState<NodeData[]>([
    { id: 'root', type: 'root', label: 'DELTA ENGENHARIA', tag: 'ALVO (PJ)', confidence: '98%', desc: 'Identidade resolvida com CNPJ 04.123.456/0001-78 na Receita Federal.', x: 50, y: 50 },
    { id: 'a', type: 'company', label: 'Empresa Alpha', tag: 'SOCIEDADE', confidence: '96%', desc: 'Vínculo societário comprovado no QSA da Receita Federal.', x: 23, y: 24 },
    { id: 'b', type: 'company', label: 'Holding Beta', tag: 'REDE', confidence: '88%', desc: 'Atributo corporativo e endereço compartilhados.', x: 78, y: 23 },
    { id: 'domain', type: 'asset', label: 'Domínio / IP', tag: 'INFRA', confidence: '91%', desc: 'Ativo digital e servidor correlacionado via WHOIS.', x: 81, y: 71 },
    { id: 'risk', type: 'risk', label: 'Sanção CGU CNEP', tag: 'CNEP / FRAUDE', confidence: '99%', desc: 'Sanção ativa por fraude em licitação (Art. 5º Lei 12.846).', x: 24, y: 75 },
    { id: 'bet', type: 'risk', label: 'BET Operadora', tag: 'BETS / APOSTAS', confidence: '76%', desc: 'Fluxo atípico para plataforma de apostas esportivas.', x: 50, y: 12 },
    { id: 'infra', type: 'asset', label: 'Gateway Pagto', tag: 'ASSET / VASP', confidence: '87%', desc: 'Infraestrutura de intermediação financeira compartilhada.', x: 89, y: 45 },
    { id: 'record', type: 'asset', label: 'Registro TSE', tag: 'DOAÇÃO ELEITORAL', confidence: '95%', desc: 'Doação eleitoral registrada na prestação de contas do TSE.', x: 48, y: 88 }
  ]);

  const edges = [
    { from: 'root', to: 'a', hot: true },
    { from: 'root', to: 'b', hot: true },
    { from: 'root', to: 'domain', hot: false },
    { from: 'root', to: 'risk', hot: true },
    { from: 'a', to: 'bet', hot: false },
    { from: 'b', to: 'infra', hot: true },
    { from: 'domain', to: 'infra', hot: false },
    { from: 'risk', to: 'record', hot: false }
  ];

  // Dragging logic
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const handlePointerDown = (id: string) => {
    setDraggingNodeId(id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingNodeId || !graphContainerRef.current) return;
    const rect = graphContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const newX = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
    const newY = Math.max(10, Math.min(90, ((clientY - rect.top) / rect.height) * 100));

    setNodes(prev =>
      prev.map(n => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handlePointerUp = () => {
    setDraggingNodeId(null);
  };

  // Run simulated or live investigation
  const runInvestigation = async () => {
    setIsRunning(true);
    setLogs([]);
    setDiscoveries([]);
    setActiveStage(0);

    const stagesConfig = [
      { name: 'Identity', msg: `[${new Date().toLocaleTimeString()}] Resolvendo entidade ${entityName}...`, disc: 'Identidade cadastrada e ativa na RFB', hit: false },
      { name: 'OSINT', msg: `[${new Date().toLocaleTimeString()}] Consultando BrasilAPI, QSA e Portal da Transparência...`, disc: '2 sócios administradores + 1 holding vinculada', hit: false },
      { name: 'CTI', msg: `[${new Date().toLocaleTimeString()}] Verificando CEIS, CNEP, OFAC SDN e PEPs...`, disc: 'SANÇÃO ATIVA no CNEP (CGU) identificada', hit: true },
      { name: 'Graph', msg: `[${new Date().toLocaleTimeString()}] Construindo Knowledge Graph com 8 nós e 8 relações...`, disc: 'Topologia em teia com contrapartes mapeadas', hit: false },
      { name: 'Attribution', msg: `[${new Date().toLocaleTimeString()}] Calculando 5 caminhos independentes de atribuição...`, disc: 'Attribution Confidence 92% • Risco 86/100', hit: true },
      { name: 'Dossier', msg: `[${new Date().toLocaleTimeString()}] Gerando dossiê regulatório explicável (BACEN 3.978)...`, disc: 'Dossiê compilado com trilha probatória', hit: true }
    ];

    for (let i = 0; i < stagesConfig.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setActiveStage(i + 1);
      setLogs(prev => [...prev, { text: stagesConfig[i].msg, type: stagesConfig[i].hit ? 'hit' : 'ok' }]);
      setDiscoveries(prev => [...prev, { stage: stagesConfig[i].name, text: stagesConfig[i].disc, hit: stagesConfig[i].hit }]);
    }

    await new Promise(r => setTimeout(r, 500));
    setLogs(prev => [...prev, { text: `[${new Date().toLocaleTimeString()}] ✓ Investigação concluída. Abrindo caso...`, type: 'ok' }]);
    setIsRunning(false);
    setSubView('case');
  };

  // Paths detail
  const [selectedPath, setSelectedPath] = useState<{ id: string; title: string; conf: string; why: string }>({
    id: 'A',
    title: 'Caminho A • 96%',
    conf: '96%',
    why: 'Três evidências independentes (QSA da Receita, contrato social e declaração) sustentam o vínculo direto.'
  });

  const paths = [
    { id: 'A', label: 'A • Alvo → Empresa Alpha', type: 'Direto', conf: '96%', why: 'Três evidências independentes (QSA da Receita, contrato social e declaração) sustentam o vínculo direto.' },
    { id: 'B', label: 'B • Alvo → Holding Beta → Infra', type: 'Convergente', conf: '91%', why: 'Relação corporativa e infraestrutura digital convergem por fontes públicas e registros de DNS distintos.' },
    { id: 'C', label: 'C • Alvo → Empresa Alpha → Sanção CGU', type: 'Segundo grau', conf: '82%', why: 'Relação indireta com ente penalizado no CNEP. Tratada como hipótese de risco e não culpa preliminar.' },
    { id: 'D', label: 'D • Rede Relacional → BET Operadora', type: 'Contextual', conf: '76%', why: 'Contexto setorial de apostas / BETS. Requer dados financeiros e transacionais KYT para confirmação.' }
  ];

  const evidenceLedger = [
    { id: 'E-101', name: 'Resolução cadastral de identidade', nature: 'Direta', ind: 'Alta', conf: '98%', use: 'Atribuição' },
    { id: 'E-114', name: 'Vínculo societário no QSA (RFB)', nature: 'Direta', ind: 'Alta', conf: '96%', use: 'Risco + Atribuição' },
    { id: 'E-122', name: 'Infraestrutura digital correlacionada', nature: 'Contextual', ind: 'Média', conf: '91%', use: 'Risco' },
    { id: 'E-137', name: 'Relação de segundo grau com sancionado', nature: 'Indireta', ind: 'Média', conf: '82%', use: 'Network' },
    { id: 'E-141', name: 'Contexto setorial BETS / Apostas', nature: 'Contextual', ind: 'Média', conf: '76%', use: 'Tipologia' }
  ];

  // Helper classes for dark vs light card
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
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="max-w-3xl relative z-10">
          <div className="flex items-center space-x-2 text-xs font-semibold mb-2">
            <span className={`px-2 py-0.5 rounded border ${
              isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              Explainable PLD Engine
            </span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Investigação Explicável & Grafo de Relações
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Atribuição de Vínculos & Grafo de Conhecimento
          </h1>
          <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Separe com rigor metodológico o <strong>Risco PLD</strong> da <strong>Força de Atribuição</strong> e da 
            <strong> Confiança Probatória</strong>. Suporta nós interativos, caminhos independentes e persistência no banco MySQL.
          </p>
        </div>
      </div>

      {/* Sub Navigation Bar (Sober Tabs) */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 transition-colors ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {[
            { id: 'start', label: '1. Investigação' },
            { id: 'case', label: '2. Caso' },
            { id: 'graph', label: '3. Grafo' },
            { id: 'paths', label: '4. Atribuição' },
            { id: 'evidence', label: '5. Evidências' },
            { id: 'report', label: '6. Dossiê PLD' },
            { id: 'api', label: '7. Saída API' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                subView === tab.id
                  ? isDark
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-900 text-white font-bold'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSubView('start')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
          }`}
        >
          Nova Análise
        </button>
      </div>

      {/* VIEW 1: START / INVESTIGATION */}
      {subView === 'start' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className={`border rounded-xl p-6 space-y-4 ${cardClass}`}>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                  isDark
                    ? 'bg-blue-950/40 text-blue-300 border-blue-800'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  SIMULAÇÃO & DADOS REAIS
                </span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Esteira em 6 Fases
                </span>
              </div>
              <h2 className="text-base font-bold">Iniciar Investigação de Vínculos</h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Tipo de Entidade
                  </label>
                  <select
                    value={entityType}
                    onChange={e => setEntityType(e.target.value as any)}
                    className={`w-full p-2.5 rounded-lg border ${inputClass}`}
                  >
                    <option value="PJ">Pessoa Jurídica (CNPJ)</option>
                    <option value="PF">Pessoa Física (CPF)</option>
                  </select>
                </div>

                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Razão Social / Nome da Entidade
                  </label>
                  <input
                    type="text"
                    value={entityName}
                    onChange={e => setEntityName(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border ${inputClass}`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Documento (CNPJ ou CPF)
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={e => setDocNumber(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border font-mono ${inputClass}`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Contexto de Risco
                  </label>
                  <select
                    value={investigationContext}
                    onChange={e => setInvestigationContext(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border ${inputClass}`}
                  >
                    <option value="PLD / AML">PLD / AML (Lavagem de Dinheiro)</option>
                    <option value="BETS">BETS & Apostas Esportivas</option>
                    <option value="Fraude">Fraude Identitária / Fantasma</option>
                    <option value="Due diligence">Due Diligence de Terceiros</option>
                  </select>
                </div>
              </div>

              <button
                onClick={runInvestigation}
                disabled={isRunning}
                className={`w-full py-2.5 text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isRunning ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Executar Investigação Ponta a Ponta</span>
                  </>
                )}
              </button>
            </div>

            {/* Methodology Explainer */}
            <div className={`border rounded-xl p-6 space-y-4 ${cardClass}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Objetivo do Motor de Atribuição
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Transformar dados mínimos de identificadores em um contexto investigativo completo, rastreável e fundamentado perante fiscalizações regulatórias.
              </p>

              <div className={`p-3.5 rounded-lg border-l-4 border-slate-500 text-xs space-y-1 ${subCardClass}`}>
                <p className="font-bold text-slate-300">O motor não declara culpa sumária.</p>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Ele quantifica a força de cada vínculo, separa fontes públicas e formula hipóteses técnicas para validação pelo analista humano.
                </p>
              </div>

              <div className={`p-3.5 rounded-lg border font-mono text-[11px] space-y-1 ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <div>INPUT (CNPJ / CPF)</div>
                <div>↓ RESOLUÇÃO CADASTRAL (RFB / BrasilAPI)</div>
                <div>↓ DADOS PÚBLICOS + OSINT (CGU, TSE, OFAC)</div>
                <div>↓ KNOWLEDGE GRAPH (Teia Societária & Infra)</div>
                <div>↓ ATTRIBUTION ENGINE (Caminhos A, B, C, D)</div>
                <div>↓ DOSSIÊ EXPLICÁVEL (Circular BACEN 3.978)</div>
              </div>
            </div>
          </div>

          {/* 6-Stage Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { num: '01', name: 'Identity' },
              { num: '02', name: 'OSINT' },
              { num: '03', name: 'CTI' },
              { num: '04', name: 'Graph' },
              { num: '05', name: 'Attribution' },
              { num: '06', name: 'Dossier' }
            ].map((st, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border text-center transition-all ${
                  activeStage === i + 1
                    ? isDark
                      ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                      : 'bg-blue-50 border-blue-500 text-blue-800'
                    : activeStage > i + 1
                    ? isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-300'
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                    : isDark
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-base font-black block font-mono">{st.num}</span>
                <span className="text-xs font-semibold">{st.name}</span>
              </div>
            ))}
          </div>

          {/* Live Log & Discoveries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`border rounded-xl p-5 space-y-3 ${cardClass}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Log da Investigação
              </h3>
              <div className={`h-52 overflow-y-auto rounded-lg p-3 font-mono text-[11px] space-y-1.5 border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                {logs.length === 0 ? (
                  <div className="text-slate-500">Aguardando início da investigação...</div>
                ) : (
                  logs.map((l, i) => (
                    <div
                      key={i}
                      className={
                        l.type === 'hit'
                          ? isDark ? 'text-amber-400 font-bold' : 'text-amber-700 font-bold'
                          : isDark ? 'text-slate-300' : 'text-slate-700'
                      }
                    >
                      {l.text}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={`border rounded-xl p-5 space-y-3 ${cardClass}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Descobertas Identificadas
              </h3>
              <div className="h-52 overflow-y-auto space-y-2 text-xs">
                {discoveries.length === 0 ? (
                  <p className="text-slate-500 text-xs">
                    Os achados aparecerão progressivamente durante o processamento.
                  </p>
                ) : (
                  discoveries.map((d, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        d.hit
                          ? isDark
                            ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                          : subCardClass
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs block">{d.stage}</span>
                        <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {d.text}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        d.hit
                          ? isDark
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {d.hit ? 'ALERTA' : 'OK'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CASE */}
      {subView === 'case' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Card */}
          <div className={`border rounded-xl p-6 flex flex-wrap items-center justify-between gap-4 ${cardClass}`}>
            <div>
              <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                CASO PLD-2026-0042 • COMPLIANCE AUDIT
              </span>
              <h2 className="text-xl font-bold mt-1">{entityName}</h2>
              <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                CNPJ: {docNumber}
              </span>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isDark
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              REVISÃO PRIORITÁRIA (EDD)
            </span>
          </div>

          {/* Metric Cards (Sober & Clear) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`border rounded-xl p-4 flex items-center space-x-4 ${cardClass}`}>
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-mono font-bold text-xl border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-slate-100 border-slate-300 text-slate-900'
              }`}>
                {pldRisk}
              </div>
              <div>
                <span className="text-sm font-bold block">PLD Risk</span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Prioridade investigativa
                </span>
              </div>
            </div>

            <div className={`border rounded-xl p-4 flex items-center space-x-4 ${cardClass}`}>
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-mono font-bold text-xl border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-blue-400'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                {attributionConfidence}%
              </div>
              <div>
                <span className="text-sm font-bold block">Attribution</span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Força da atribuição
                </span>
              </div>
            </div>

            <div className={`border rounded-xl p-4 flex items-center space-x-4 ${cardClass}`}>
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-mono font-bold text-xl border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                {evidenceConfidence}%
              </div>
              <div>
                <span className="text-sm font-bold block">Evidence</span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Confiança probatória
                </span>
              </div>
            </div>
          </div>

          {/* Drivers & Interpretation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`border rounded-xl p-5 space-y-4 ${cardClass}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Drivers de Risco
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { name: 'Identidade Cadastral Resolvida', value: '98%' },
                  { name: 'Vínculo Societário Formal (QSA)', value: '96%' },
                  { name: 'Infraestrutura Compartilhada', value: '91%' },
                  { name: 'Rede de Relacionamento Indireto', value: '82%' }
                ].map((d, i) => (
                  <div key={i}>
                    <div className="flex justify-between font-medium mb-1">
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{d.name}</span>
                      <span className="font-mono text-slate-500">{d.value}</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                      isDark ? 'bg-slate-800' : 'bg-slate-200'
                    }`}>
                      <div
                        className={isDark ? 'bg-blue-500 h-full' : 'bg-slate-900 h-full'}
                        style={{ width: d.value }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`border rounded-xl p-5 space-y-4 flex flex-col justify-between ${cardClass}`}>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Parecer Técnico Inicial
                </h3>
                <div className={`p-4 rounded-lg border text-xs mt-2 space-y-1.5 ${subCardClass}`}>
                  <p className="font-bold">Alta atribuição requer contexto.</p>
                  <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Os vínculos mapeados possuem suporte documental sólido no QSA e na CGU. Recomendada diligência reforçada (EDD) e cruzamento com a movimentação transacional (KYT).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSubView('graph')}
                className={`w-full py-2.5 font-semibold rounded-lg text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>Explorar Grafo de Vínculos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: KNOWLEDGE GRAPH */}
      {subView === 'graph' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'all', label: 'Todos os Nós' },
                { id: 'company', label: 'Sócios & Empresas' },
                { id: 'asset', label: 'Infra & Ativos' },
                { id: 'risk', label: 'Sanções & Risco' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    filterType === f.id
                      ? isDark
                        ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                        : 'bg-slate-900 text-white font-bold'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Arraste os nós para reorganizar o mapa
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive Graph Canvas */}
            <div className={`lg:col-span-8 border rounded-xl p-3 relative ${cardClass}`}>
              {/* Zoom Controls */}
              <div className="absolute top-5 left-5 z-20 flex gap-1.5">
                <button
                  onClick={() => setZoom(z => Math.min(1.5, z + 0.15))}
                  className={`w-7 h-7 rounded border text-xs flex items-center justify-center transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(z => Math.max(0.7, z - 0.15))}
                  className={`w-7 h-7 rounded border text-xs flex items-center justify-center transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className={`w-7 h-7 rounded border text-xs flex items-center justify-center transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Canvas Container */}
              <div
                ref={graphContainerRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`h-[500px] rounded-lg relative overflow-hidden select-none touch-none border ${
                  isDark
                    ? 'bg-[#0b1320] border-slate-800'
                    : 'bg-[#f8fafc] border-slate-200'
                }`}
                style={{ transform: `scale(${zoom})`, transformOrigin: '50% 50%' }}
              >
                {/* SVG Connecting Edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {edges.map((edge, idx) => {
                    const fromNode = nodes.find(n => n.id === edge.from);
                    const toNode = nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    const isFromVisible = filterType === 'all' || fromNode.type === filterType || fromNode.type === 'root';
                    const isToVisible = filterType === 'all' || toNode.type === filterType || toNode.type === 'root';

                    if (!isFromVisible || !isToVisible) return null;

                    return (
                      <line
                        key={idx}
                        x1={`${fromNode.x}%`}
                        y1={`${fromNode.y}%`}
                        x2={`${toNode.x}%`}
                        y2={`${toNode.y}%`}
                        stroke={edge.hot ? (isDark ? '#e11d48' : '#be123c') : (isDark ? '#334155' : '#cbd5e1')}
                        strokeWidth={edge.hot ? '2' : '1.5'}
                        strokeDasharray={edge.hot ? 'none' : '3 3'}
                      />
                    );
                  })}
                </svg>

                {/* Nodes (Sober styling) */}
                {nodes.map(node => {
                  const isVisible = filterType === 'all' || node.type === filterType || node.type === 'root';
                  if (!isVisible) return null;

                  const isSelected = selectedNode?.id === node.id;
                  const isRoot = node.type === 'root';

                  let nodeBg = '';
                  let nodeBorder = '';
                  let nodeText = '';

                  if (isDark) {
                    if (isRoot) {
                      nodeBg = 'bg-slate-900';
                      nodeBorder = 'border-2 border-blue-400';
                      nodeText = 'text-white';
                    } else if (node.type === 'risk') {
                      nodeBg = 'bg-rose-950/70';
                      nodeBorder = 'border border-rose-500';
                      nodeText = 'text-rose-200';
                    } else if (node.type === 'company') {
                      nodeBg = 'bg-slate-850 bg-slate-800';
                      nodeBorder = 'border border-slate-600';
                      nodeText = 'text-slate-200';
                    } else {
                      nodeBg = 'bg-slate-900';
                      nodeBorder = 'border border-slate-700';
                      nodeText = 'text-slate-300';
                    }
                  } else {
                    if (isRoot) {
                      nodeBg = 'bg-slate-900';
                      nodeBorder = 'border-2 border-slate-900';
                      nodeText = 'text-white';
                    } else if (node.type === 'risk') {
                      nodeBg = 'bg-rose-50';
                      nodeBorder = 'border border-rose-300';
                      nodeText = 'text-rose-900';
                    } else if (node.type === 'company') {
                      nodeBg = 'bg-white';
                      nodeBorder = 'border border-slate-300';
                      nodeText = 'text-slate-900';
                    } else {
                      nodeBg = 'bg-slate-100';
                      nodeBorder = 'border border-slate-300';
                      nodeText = 'text-slate-800';
                    }
                  }

                  return (
                    <button
                      key={node.id}
                      onPointerDown={() => handlePointerDown(node.id)}
                      onClick={() => setSelectedNode(node)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center text-center p-2 cursor-grab active:cursor-grabbing transition-transform ${
                        isRoot ? 'w-22 h-22' : 'w-18 h-18'
                      } ${nodeBg} ${nodeBorder} ${nodeText} ${
                        isSelected ? 'ring-3 ring-blue-500 scale-105 shadow-md' : 'shadow-xs'
                      }`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <span className="text-[10px] font-bold leading-tight line-clamp-2">
                        {node.label}
                      </span>
                      <span className="text-[9px] opacity-70 font-mono mt-0.5">
                        {node.confidence}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Relationship Inspector Panel */}
            <div className={`lg:col-span-4 border rounded-xl p-5 space-y-4 flex flex-col justify-between ${cardClass}`}>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider pb-3 border-b ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}>
                  Relationship Inspector
                </h3>

                {selectedNode ? (
                  <div className="space-y-3 mt-4 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isDark
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {selectedNode.tag}
                    </span>

                    <h4 className="text-sm font-bold mt-1">
                      {selectedNode.label}
                    </h4>

                    <div className={`p-3 rounded-lg border space-y-2 ${subCardClass}`}>
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Atribuição:</span>
                        <span className="font-bold">{selectedNode.confidence}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {selectedNode.desc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs mt-4">
                    <p className="font-medium mb-1">Selecione um nó no grafo</p>
                    <p className="text-[11px]">
                      Clique para inspecionar os atributos, tipo de relacionamento e força da conexão.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSubView('paths')}
                className={`w-full py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                Explicar Caminhos de Atribuição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: ATTRIBUTION PATHS */}
      {subView === 'paths' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          <div className={`border rounded-xl p-5 space-y-3 ${cardClass}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Caminhos Independentes de Atribuição
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Clique para detalhar a consistência e as fontes de cada rota.
            </p>

            <div className="space-y-2 pt-2">
              {paths.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPath(p as any)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer text-xs ${
                    selectedPath.id === p.id
                      ? isDark
                        ? 'bg-slate-800 border-blue-500 text-white'
                        : 'bg-slate-100 border-slate-900 text-slate-900'
                      : subCardClass
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{p.label}</span>
                    <span className="font-mono font-bold">{p.conf}</span>
                  </div>
                  <span className={`text-[11px] block mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Tipo: {p.type} • Confiança: {p.conf}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`border rounded-xl p-5 space-y-4 ${cardClass}`}>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {selectedPath.title}
              </h3>
              <p className={`text-xs mt-2 p-3 rounded-lg border leading-relaxed ${subCardClass}`}>
                {selectedPath.why}
              </p>
            </div>

            <div className={`p-4 rounded-lg border font-mono text-[11px] space-y-2 ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <span className="font-bold block">Critérios do Algoritmo:</span>
              <div className="space-y-1 text-slate-400 text-[10px]">
                <div>+ Resolução consistente de CPF/CNPJ</div>
                <div>+ Fontes oficiais primárias (RFB, CGU, TSE)</div>
                <div>+ Vínculo societário direto</div>
                <div>+ Convergência de múltiplos caminhos</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: EVIDENCE LEDGER */}
      {subView === 'evidence' && (
        <div className={`border rounded-xl p-5 space-y-4 animate-in fade-in ${cardClass}`}>
          <div className={`flex items-center justify-between border-b pb-3 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Evidence Ledger (Trilha Probatória de Conformidade)
            </h3>
            <span className="text-xs font-mono text-slate-500">{evidenceLedger.length} Evidências Registradas</span>
          </div>

          <div className={`overflow-x-auto rounded-lg border ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <table className="w-full text-left text-xs">
              <thead className={`font-semibold border-b ${
                isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Evidência</th>
                  <th className="p-3">Natureza</th>
                  <th className="p-3">Independência</th>
                  <th className="p-3">Confiança</th>
                  <th className="p-3">Finalidade</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono ${
                isDark ? 'divide-slate-800' : 'divide-slate-200'
              }`}>
                {evidenceLedger.map((ev, i) => (
                  <tr key={i} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                    <td className="p-3 font-bold">{ev.id}</td>
                    <td className="p-3 font-sans">{ev.name}</td>
                    <td className="p-3">{ev.nature}</td>
                    <td className="p-3">{ev.ind}</td>
                    <td className="p-3 font-bold">{ev.conf}</td>
                    <td className="p-3 font-sans text-slate-500">{ev.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 6: REPORT */}
      {subView === 'report' && (
        <div className={`border rounded-xl p-6 space-y-5 animate-in fade-in ${cardClass}`}>
          <div className={`flex flex-wrap items-start justify-between gap-4 border-b pb-4 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                isDark
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}>
                DOSSIÊ DE COMPLIANCE
              </span>
              <h2 className="text-lg font-bold mt-1">
                Relatório de Inteligência Contextual & Atribuição
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Caso PLD-2026-0042 • {entityName}
              </p>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black font-mono">{pldRisk}</span>
              <span className="text-xs text-slate-500 block font-semibold">/ 100 PLD Risk</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            <div className={`p-4 rounded-lg border space-y-2 ${subCardClass}`}>
              <h4 className="font-bold uppercase tracking-wider text-slate-400">Resumo Executivo</h4>
              <p className="leading-relaxed">
                A entidade foi priorizada pela convergência entre resolução cadastral na Receita Federal, vínculos societários no QSA e sanção administrativa no CNEP (CGU).
              </p>
            </div>

            <div className={`p-4 rounded-lg border space-y-2 ${subCardClass}`}>
              <h4 className="font-bold uppercase tracking-wider text-slate-400">Indicadores do Caso</h4>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">PLD Risk Score:</span>
                  <span className="font-bold">{pldRisk} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Attribution Confidence:</span>
                  <span className="font-bold">{attributionConfidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Evidence Confidence:</span>
                  <span className="font-bold">{evidenceConfidence}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={() => setSubView('api')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              Ver Saída API
            </button>
          </div>
        </div>
      )}

      {/* VIEW 7: API OUTPUT */}
      {subView === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          <div className={`border rounded-xl p-5 space-y-3 ${cardClass}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saída Estruturada (REST API)
            </h3>
            <pre className={`p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
{JSON.stringify(
  {
    case_id: "PLD-2026-0042",
    target_entity: entityName,
    document: docNumber,
    pld_risk: pldRisk,
    attribution_confidence: attributionConfidence / 100,
    evidence_confidence: evidenceConfidence / 100,
    independent_paths: 5,
    typology_hypotheses: [
      "pass_through",
      "relational_network",
      "cnep_sanction_exposure"
    ],
    human_review_required: true,
    mysql_case_synced: true
  },
  null,
  2
)}
            </pre>
          </div>

          <div className={`border rounded-xl p-5 space-y-4 ${cardClass}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Persistência no Banco MySQL
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Estrutura persistida nas tabelas relacionais <code className="font-mono font-bold">grafo_casos</code>, 
              <code className="font-mono font-bold"> grafo_nos</code>, <code className="font-mono font-bold"> grafo_arestas</code> e 
              <code className="font-mono font-bold"> grafo_evidencias</code> do seu banco de dados MySQL.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
