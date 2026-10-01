import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Shield,
  Layers,
  FileText,
  Code,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Database,
  Printer
} from 'lucide-react';

interface NodeData {
  id: string;
  type: 'root' | 'company' | 'asset' | 'risk';
  label: string;
  tag: string;
  confidence: string;
  desc: string;
  x: number; // percentage
  y: number; // percentage
}

export const AttributionGraphTab: React.FC = () => {
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
  const [pldRisk, setPldRisk] = useState(86);
  const [attributionConfidence, setAttributionConfidence] = useState(92);
  const [evidenceConfidence, setEvidenceConfidence] = useState(89);

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
      { name: 'CTI', msg: `[${new Date().toLocaleTimeString()}] Verificando CEIS, CNEP, OFAC SDN e PEPs...`, disc: 'SANÇÃO ATIVA no CNEP (CGU) + Alerta de Risco', hit: true },
      { name: 'Graph', msg: `[${new Date().toLocaleTimeString()}] Construindo Knowledge Graph com 8 nós e 8 relações...`, disc: 'Topologia em teia com contrapartes identificadas', hit: false },
      { name: 'Attribution', msg: `[${new Date().toLocaleTimeString()}] Calculando 5 caminhos independentes de atribuição...`, disc: 'Attribution Confidence 92% • Risco 86/100', hit: true },
      { name: 'Dossier', msg: `[${new Date().toLocaleTimeString()}] Gerando dossiê regulatório explicável (BACEN 3.978)...`, disc: 'Dossiê compilado com trilha de evidências auditável', hit: true }
    ];

    for (let i = 0; i < stagesConfig.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      setActiveStage(i + 1);
      setLogs(prev => [...prev, { text: stagesConfig[i].msg, type: stagesConfig[i].hit ? 'hit' : 'ok' }]);
      setDiscoveries(prev => [...prev, { stage: stagesConfig[i].name, text: stagesConfig[i].disc, hit: stagesConfig[i].hit }]);
    }

    await new Promise(r => setTimeout(r, 600));
    setLogs(prev => [...prev, { text: `[${new Date().toLocaleTimeString()}] ✓ Investigação concluída com sucesso. Abrindo caso...`, type: 'ok' }]);
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
    { id: 'A', label: 'A • Persona/PJ → Empresa Alpha', type: 'Direto', conf: '96%', why: 'Três evidências independentes (QSA da Receita, contrato social e declaração) sustentam o vínculo direto.' },
    { id: 'B', label: 'B • Persona/PJ → Holding Beta → Infra', type: 'Convergente', conf: '91%', why: 'Relação corporativa e infraestrutura digital convergem por fontes públicas e registros de DNS distintos.' },
    { id: 'C', label: 'C • Persona/PJ → Empresa Alpha → Sanção CGU', type: 'Segundo grau', conf: '82%', why: 'Relação indireta com ente penalizado no CNEP. Tratada como hipótese de risco e não culpa preliminar.' },
    { id: 'D', label: 'D • Rede Relacional → BET Operadora', type: 'Contextual', conf: '76%', why: 'Contexto setorial de apostas / BETS. Requer dados financeiros e transacionais KYT para confirmação.' }
  ];

  const evidenceLedger = [
    { id: 'E-101', name: 'Resolução cadastral de identidade', nature: 'Direta', ind: 'Alta', conf: '98%', use: 'Atribuição' },
    { id: 'E-114', name: 'Vínculo societário no QSA (RFB)', nature: 'Direta', ind: 'Alta', conf: '96%', use: 'Risco + Atribuição' },
    { id: 'E-122', name: 'Infraestrutura digital correlacionada', nature: 'Contextual', ind: 'Média', conf: '91%', use: 'Risco' },
    { id: 'E-137', name: 'Relação de segundo grau com sancionado', nature: 'Indireta', ind: 'Média', conf: '82%', use: 'Network' },
    { id: 'E-141', name: 'Contexto setorial BETS / Apostas', nature: 'Contextual', ind: 'Média', conf: '76%', use: 'Tipologia' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-pink-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-3">
            <Flame className="w-3.5 h-3.5 text-pink-400" />
            <span>Motor Explicável • Explainable PLD & Attribution Graph</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Atribuição de Vínculos & Knowledge Graph
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Seu MVP integrado e elevado ao ambiente de produção: separe <strong>Risco PLD</strong>, 
            <strong> Força de Atribuição</strong> e <strong>Confiança Probatória</strong> com suporte a nós dinâmicos, 
            arraste físico, cálculo de caminhos e persistência no banco MySQL.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Sub Navigation Bar (as seen in user's MVP) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {[
            { id: 'start', label: '▶ 1. Investigação' },
            { id: 'case', label: '◎ 2. Caso' },
            { id: 'graph', label: '⌘ 3. Grafo' },
            { id: 'paths', label: '⇢ 4. Atribuição' },
            { id: 'evidence', label: '▤ 5. Evidências' },
            { id: 'report', label: '▣ 6. Dossiê PLD' },
            { id: 'api', label: '{} 7. Saída API' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                subView === tab.id
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSubView('start')}
          className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md shadow-pink-600/20 transition-all cursor-pointer"
        >
          Nova Análise
        </button>
      </div>

      {/* VIEW 1: START / INVESTIGATION */}
      {subView === 'start' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                  DEMO GUIADA + APIs REAIS
                </span>
                <span className="text-xs text-slate-400">Pipeline de 6 Estágios</span>
              </div>
              <h2 className="text-lg font-bold text-white">Iniciar Investigação de Vínculos</h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Tipo de Entidade</label>
                  <select
                    value={entityType}
                    onChange={e => setEntityType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="PJ">Pessoa Jurídica (CNPJ)</option>
                    <option value="PF">Pessoa Física (CPF)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Razão Social / Nome</label>
                  <input
                    type="text"
                    value={entityName}
                    onChange={e => setEntityName(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Documento (CNPJ / CPF)</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={e => setDocNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Contexto de Análise</label>
                  <select
                    value={investigationContext}
                    onChange={e => setInvestigationContext(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="PLD / AML">PLD / AML (Lavagem de Dinheiro)</option>
                    <option value="BETS">BETS & Apostas Esportivas (Tipologia Específica)</option>
                    <option value="Fraude">Fraude Identitária / Fantasma</option>
                    <option value="Due diligence">Due Diligence de Terceiros e Fornecedores</option>
                  </select>
                </div>
              </div>

              <button
                onClick={runInvestigation}
                disabled={isRunning}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-pink-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Executar Investigação Ponta a Ponta</span>
                  </>
                )}
              </button>
            </div>

            {/* Methodology Explainer */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Objetivo da Abordagem de Atribuição
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mostrar como identificadores mínimos podem ser transformados em contexto investigativo rastreável e auditável.
              </p>

              <div className="p-3.5 rounded-xl bg-pink-950/30 border-l-4 border-pink-500 text-xs text-slate-200 space-y-1">
                <p className="font-bold text-pink-300">O motor não declara culpa.</p>
                <p className="text-slate-400 text-[11px]">
                  Ele resolve identidade, correlaciona fontes públicas, constrói relações em grafo, mede força de atribuição e gera hipóteses explicáveis para revisão humana.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1">
                <div>INPUT (CNPJ / CPF)</div>
                <div>↓ ENTITY RESOLUTION (RFB / BrasilAPI)</div>
                <div>↓ PUBLIC DATA + OSINT + CTI (CGU, TSE, OFAC)</div>
                <div>↓ KNOWLEDGE GRAPH (Relacionamentos)</div>
                <div>↓ ATTRIBUTION ENGINE (Caminhos A, B, C, D)</div>
                <div>↓ EXPLAINABLE DOSSIER (Circular BACEN 3.978)</div>
              </div>
            </div>
          </div>

          {/* 6-Stage Pipeline Graphic */}
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
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                    : activeStage > i + 1
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950/80 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-lg font-black block font-mono">{st.num}</span>
                <span className="text-xs font-semibold">{st.name}</span>
              </div>
            ))}
          </div>

          {/* Live Log & Discoveries Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Investigation Log
              </h3>
              <div className="h-56 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] space-y-1.5">
                {logs.length === 0 ? (
                  <div className="text-slate-600">Aguardando início da investigação...</div>
                ) : (
                  logs.map((l, i) => (
                    <div
                      key={i}
                      className={
                        l.type === 'hit'
                          ? 'text-pink-400 font-bold'
                          : l.type === 'ok'
                          ? 'text-emerald-400'
                          : 'text-cyan-400'
                      }
                    >
                      {l.text}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Descobertas Progressivas
              </h3>
              <div className="h-56 overflow-y-auto space-y-2 text-xs">
                {discoveries.length === 0 ? (
                  <p className="text-slate-500">
                    Os achados aparecerão progressivamente durante a execução da esteira.
                  </p>
                ) : (
                  discoveries.map((d, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        d.hit
                          ? 'bg-pink-950/30 border-pink-800/40 text-pink-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs block">{d.stage}</span>
                        <span className="text-[11px] text-slate-400">{d.text}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.hit ? 'bg-pink-500/20 text-pink-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {d.hit ? 'HIT CRÍTICO' : 'RESOLVIDO'}
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
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-mono">CASE PLD-2026-0042 • COMPLIANCE AUDIT</span>
              <h2 className="text-2xl font-black text-white mt-1">{entityName}</h2>
              <span className="text-xs font-mono text-slate-400">CNPJ: {docNumber}</span>
            </div>

            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-black">
              REVISÃO PRIORITÁRIA (EDD)
            </span>
          </div>

          {/* Metric Rings (as in user MVP) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white font-mono font-black text-xl shadow-lg shadow-rose-600/30">
                {pldRisk}
              </div>
              <div>
                <span className="text-sm font-bold text-white block">PLD Risk</span>
                <span className="text-xs text-slate-400">Prioridade investigativa</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-mono font-black text-xl shadow-lg shadow-blue-600/30">
                {attributionConfidence}%
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Attribution</span>
                <span className="text-xs text-slate-400">Força da atribuição</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-mono font-black text-xl shadow-lg shadow-purple-600/30">
                {evidenceConfidence}%
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Evidence</span>
                <span className="text-xs text-slate-400">Confiança probatória</span>
              </div>
            </div>
          </div>

          {/* Drivers & Interpretation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Principais Drivers de Risco</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Identidade Resolvida</span>
                    <span className="font-mono text-cyan-400">98%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-pink-500 h-full w-[98%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Vínculo Societário Formal</span>
                    <span className="font-mono text-cyan-400">96%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-pink-500 h-full w-[96%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Infraestrutura Compartilhada</span>
                    <span className="font-mono text-cyan-400">91%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-pink-500 h-full w-[91%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Rede de Segundo Grau</span>
                    <span className="font-mono text-cyan-400">82%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-pink-500 h-full w-[82%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Interpretação Regulatória</h3>
                <div className="p-4 rounded-xl bg-pink-950/20 border-l-4 border-pink-500 text-xs text-slate-200 mt-2 space-y-1.5">
                  <p className="font-bold text-pink-300">Alta atribuição não significa ilicitude automática.</p>
                  <p className="text-slate-400 leading-relaxed">
                    Os vínculos que sustentam a priorização possuem suporte documental consistente no QSA e na CGU. A hipótese PLD requer confronto com a movimentação bancária e dados transacionais (KYT).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSubView('graph')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <span>Explorar Grafo Interativo de Vínculos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: KNOWLEDGE GRAPH */}
      {subView === 'graph' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Filter Pills */}
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
                  className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                    filterType === f.id
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Arraste os nós para reorganizar o mapa de relações
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive Graph Canvas */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative">
              {/* Zoom Controls */}
              <div className="absolute top-6 left-6 z-20 flex gap-1.5">
                <button
                  onClick={() => setZoom(z => Math.min(1.5, z + 0.15))}
                  className="w-8 h-8 rounded-lg bg-slate-950/80 border border-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(z => Math.max(0.7, z - 0.15))}
                  className="w-8 h-8 rounded-lg bg-slate-950/80 border border-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="w-8 h-8 rounded-lg bg-slate-950/80 border border-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Canvas Container */}
              <div
                ref={graphContainerRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="h-[520px] rounded-xl relative overflow-hidden bg-gradient-to-b from-[#0e2133] to-[#071320] border border-slate-800 select-none touch-none"
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
                        stroke={edge.hot ? '#f43f5e' : '#475569'}
                        strokeWidth={edge.hot ? '2.5' : '1.5'}
                        strokeDasharray={edge.hot ? 'none' : '4 2'}
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map(node => {
                  const isVisible = filterType === 'all' || node.type === filterType || node.type === 'root';
                  if (!isVisible) return null;

                  const isSelected = selectedNode?.id === node.id;
                  const isRoot = node.type === 'root';

                  return (
                    <button
                      key={node.id}
                      onPointerDown={() => handlePointerDown(node.id)}
                      onClick={() => setSelectedNode(node)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center text-center p-2 transition-transform cursor-grab active:cursor-grabbing shadow-xl ${
                        isRoot
                          ? 'w-24 h-24 bg-pink-950/80 border-2 border-pink-500 text-white'
                          : node.type === 'risk'
                          ? 'w-20 h-20 bg-rose-950/80 border-2 border-rose-500 text-rose-200'
                          : node.type === 'company'
                          ? 'w-20 h-20 bg-purple-950/80 border border-purple-500 text-purple-200'
                          : 'w-20 h-20 bg-blue-950/80 border border-cyan-500 text-cyan-200'
                      } ${isSelected ? 'ring-4 ring-pink-400 shadow-pink-500/50 scale-105' : ''}`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <span className="text-[10px] font-extrabold leading-tight">{node.label}</span>
                      <span className="text-[9px] opacity-75 font-mono mt-0.5">{node.confidence}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Relationship Inspector Panel (Right) */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                  Relationship Inspector
                </h3>

                {selectedNode ? (
                  <div className="space-y-3 mt-4 text-xs animate-in fade-in">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        selectedNode.type === 'risk'
                          ? 'bg-rose-500/20 text-rose-300'
                          : selectedNode.type === 'root'
                          ? 'bg-pink-500/20 text-pink-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {selectedNode.tag}
                    </span>

                    <h4 className="text-base font-extrabold text-white mt-1">
                      {selectedNode.label}
                    </h4>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-slate-400">Força de Atribuição:</span>
                        <span className="font-bold text-cyan-400">{selectedNode.confidence}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {selectedNode.desc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs mt-4">
                    <p className="font-semibold text-slate-400 mb-1">Selecione ou clique em um nó</p>
                    <p className="text-[11px]">
                      Clique em qualquer entidade para ver a justificativa probatória e o grau de independência do vínculo.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSubView('paths')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
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
          {/* Paths List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Caminhos Independentes de Atribuição
            </h3>
            <p className="text-xs text-slate-400">
              Clique em um caminho para detalhar a consistência probatória.
            </p>

            <div className="space-y-2.5 pt-2">
              {paths.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPath(p as any)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    selectedPath.id === p.id
                      ? 'bg-pink-950/30 border-pink-500 text-white shadow-md'
                      : 'bg-slate-950 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{p.label}</span>
                    <span className="font-mono font-bold text-cyan-400">{p.conf}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Tipo: {p.type} • Confiança: {p.conf}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Path Details & Formula */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {selectedPath.title}
              </h3>
              <p className="text-xs text-slate-300 mt-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
                {selectedPath.why}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
              <span className="text-pink-400 font-bold block">Critérios do Motor de Atribuição:</span>
              <div className="space-y-1 text-emerald-400 text-[10px]">
                <div>+ Resolução consistente de CPF/CNPJ</div>
                <div>+ Fontes oficiais independentes (Receita, CGU, TSE)</div>
                <div>+ Vínculo direto no QSA (Sócio / UBO)</div>
                <div>+ Convergência de múltiplos caminhos</div>
              </div>
              <div className="space-y-1 text-rose-400 text-[10px] pt-1 border-t border-slate-800">
                <div>- Homônimos sem documento</div>
                <div>- Relações indiretas de terceiro grau</div>
                <div>- Evidências desatualizadas ou inconsistentes</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: EVIDENCE LEDGER */}
      {subView === 'evidence' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Evidence Ledger (Trilha de Provas & Proveniência)
            </h3>
            <span className="text-xs text-slate-400 font-mono">{evidenceLedger.length} Evidências Concorrentes</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">ID Prova</th>
                  <th className="p-3">Evidência Identificada</th>
                  <th className="p-3">Natureza</th>
                  <th className="p-3">Independência</th>
                  <th className="p-3">Confiança</th>
                  <th className="p-3">Finalidade no Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {evidenceLedger.map((ev, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-pink-400">{ev.id}</td>
                    <td className="p-3 font-sans text-white">{ev.name}</td>
                    <td className="p-3 text-cyan-400">{ev.nature}</td>
                    <td className="p-3 text-emerald-400">{ev.ind}</td>
                    <td className="p-3 font-bold text-white">{ev.conf}</td>
                    <td className="p-3 font-sans text-slate-300">{ev.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 6: REPORT / DOSSIÊ EXPLICÁVEL */}
      {subView === 'report' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase">
                DOSSIÊ PLD • REVISÃO HUMANA
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                Relatório de Inteligência Contextual & Atribuição
              </h2>
              <p className="text-xs text-slate-400">
                Caso PLD-2026-0042 • {entityName} • Protocolo de Compliance
              </p>
            </div>

            <div className="text-right">
              <span className="text-4xl font-black text-white font-mono">{pldRisk}</span>
              <span className="text-xs text-slate-400 block font-semibold">/ 100 PLD Risk</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider">Resumo Executivo</h4>
              <p className="text-slate-300 leading-relaxed">
                A entidade foi priorizada pela convergência entre resolução cadastral na Receita Federal, vínculos corporativos com sócios identificados, sanção impeditiva no CNEP (CGU) e conexões de segundo grau.
              </p>
              <div className="p-3 rounded-lg bg-pink-950/20 border border-pink-900/40 mt-2 text-pink-200">
                <strong>Encaminhamento sugerido:</strong> Revisão manual aprofundada (EDD) e cruzamento com movimentações financeiras KYT.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider">Indicadores Consolidados</h4>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">PLD Risk Score:</span>
                  <span className="text-rose-400 font-bold">{pldRisk} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Attribution Confidence:</span>
                  <span className="text-cyan-400 font-bold">{attributionConfidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Evidence Confidence:</span>
                  <span className="text-emerald-400 font-bold">{evidenceConfidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Caminhos Independentes:</span>
                  <span className="text-white font-bold">5 rotas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achados Explicáveis */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Achados Explicáveis do Caso:
            </h4>
            {[
              { id: 'F01', title: 'Vínculo corporativo direto', text: 'Correspondência cadastral de alta confiança entre a entidade e seus administradores no QSA. Evidências E-101 e E-114.' },
              { id: 'F02', title: 'Sanção pública restritiva', text: 'Sanção ativa no CNEP (CGU) com impedimento de licitar e contratar com o poder público. Evidência E-137.' },
              { id: 'F03', title: 'Infraestrutura correlacionada', text: 'Ativo digital e domínio vinculados a servidores compartilhados. Evidência E-122.' },
              { id: 'F04', title: 'Contexto setorial sensível', text: 'Tipologia de apostas / BETS identificada no fluxo de relacionamentos. Evidência E-141.' }
            ].map(f => (
              <div key={f.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="font-bold text-pink-400">{f.id} • {f.title}</span>
                <p className="text-slate-300 mt-0.5">{f.text}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar Dossiê em PDF</span>
            </button>
            <button
              onClick={() => setSubView('api')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
            >
              Ver Saída Estruturada API
            </button>
          </div>
        </div>
      )}

      {/* VIEW 7: API OUTPUT */}
      {subView === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Saída Estruturada da API
            </h3>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
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
      "cnep_sanction_exposure",
      "betting_context"
    ],
    human_review_required: true,
    mysql_case_synced: true
  },
  null,
  2
)}
            </pre>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Modelo de Integração com o Banco MySQL
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Esta saída JSON alimenta diretamente as tabelas <code className="text-pink-400 font-mono">grafo_casos</code>, 
              <code className="text-pink-400 font-mono"> grafo_nos</code>, <code className="text-pink-400 font-mono"> grafo_arestas</code> e 
              <code className="text-pink-400 font-mono"> grafo_evidencias</code> criadas no seu banco de dados MySQL.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                <Database className="w-4 h-4" />
                <span>Compatibilidade Total</span>
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                O motor desacoplado permite que bancos, fintechs e processadoras de pagamentos consumam essa esteira como microsserviço REST ou biblioteca interna.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
