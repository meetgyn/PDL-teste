import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  Copy,
  Check,
  Download,
  Key,
  HardDrive,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Terminal,
  FileCode,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';

export const DatabaseSchemaTab: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState('empresas_cnpj');
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [loadingSchema, setLoadingSchema] = useState(false);

  // MySQL connection test form
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('3306');
  const [user, setUser] = useState('root');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('pld_kyt_db');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    setLoadingSchema(true);
    try {
      const res = await fetch('/api/db/schema');
      const sql = await res.text();
      setSchemaSql(sql);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([schemaSql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'schema_sentinela_pld_mysql.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/db/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, user, password, database })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Erro ao contatar o backend para teste de banco.',
        error: err.message
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Table definitions for the interactive visualizer
  const tables = [
    {
      name: 'empresas_cnpj',
      desc: 'Base de PJs da Receita Federal e enriquecida via BrasilAPI',
      recordEstimate: '55+ Milhões (RFB)',
      columns: [
        { name: 'cnpj', type: 'VARCHAR(14)', key: 'PK', desc: 'Chave primária numérica sem pontuação' },
        { name: 'razao_social', type: 'VARCHAR(255)', key: 'INDEX', desc: 'Razão social oficial da RFB' },
        { name: 'nome_fantasia', type: 'VARCHAR(255)', key: '', desc: 'Nome fantasia de mercado' },
        { name: 'situacao_cadastral', type: 'VARCHAR(50)', key: 'INDEX', desc: 'ATIVA, BAIXADA, INAPTA, SUSPENSA' },
        { name: 'cnae_fiscal_principal', type: 'VARCHAR(10)', key: 'INDEX', desc: 'Código CNAE para cálculo de risco setorial' },
        { name: 'capital_social', type: 'DECIMAL(15,2)', key: '', desc: 'Valor do capital social registrado' },
        { name: 'uf', type: 'CHAR(2)', key: 'INDEX', desc: 'Unidade Federativa (UF)' },
        { name: 'municipio', type: 'VARCHAR(100)', key: 'INDEX', desc: 'Município de localização' }
      ]
    },
    {
      name: 'socios_qsa',
      desc: 'Quadro Societário e Administradores (UBO - Beneficiário Final)',
      recordEstimate: '28+ Milhões (RFB)',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', desc: 'Identificador do vínculo societário' },
        { name: 'cnpj', type: 'VARCHAR(14)', key: 'FK', desc: 'Referência à empresa investigada' },
        { name: 'nome_socio', type: 'VARCHAR(255)', key: 'INDEX', desc: 'Nome completo do sócio/administrador' },
        { name: 'cnpj_cpf_socio', type: 'VARCHAR(14)', key: 'INDEX', desc: 'CPF mascarado ou CNPJ da holding' },
        { name: 'qualificacao_socio', type: 'VARCHAR(100)', key: '', desc: 'Sócio-Administrador, Diretor, etc.' },
        { name: 'is_pep', type: 'BOOLEAN', key: 'INDEX', desc: 'Flag positiva se identificado como PEP' },
        { name: 'is_sancionado', type: 'BOOLEAN', key: 'INDEX', desc: 'Flag positiva se em lista restritiva' }
      ]
    },
    {
      name: 'sancoes_cgu',
      desc: 'Cadastros Nacionais de Sanções (CEIS, CNEP, CEPIM, CEAF)',
      recordEstimate: '~120.000 Registros',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', desc: 'Identificador da sanção' },
        { name: 'cadastro', type: 'ENUM(CEIS, CNEP, ...)', key: 'INDEX', desc: 'Tipo do cadastro oficial da CGU' },
        { name: 'tipo_pessoa', type: 'ENUM(PF, PJ)', key: '', desc: 'Física ou Jurídica' },
        { name: 'documento_limpo', type: 'VARCHAR(14)', key: 'INDEX', desc: 'CPF ou CNPJ sancionado' },
        { name: 'nome_sancionado', type: 'VARCHAR(255)', key: 'INDEX', desc: 'Nome ou Razão Social' },
        { name: 'orgao_sancionador', type: 'VARCHAR(255)', key: '', desc: 'Ministério, TCU, CGU, Prefeitura' },
        { name: 'fundamento_legal', type: 'TEXT', key: '', desc: 'Artigo da Lei 12.846 ou 8.666/14.133' },
        { name: 'data_fim_sancao', type: 'DATE', key: '', desc: 'Data limite do impedimento' }
      ]
    },
    {
      name: 'listas_internacionais',
      desc: 'OFAC SDN, Conselho de Segurança da ONU, União Europeia',
      recordEstimate: '~90.000 Registros Globais',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', desc: 'ID sequencial' },
        { name: 'fonte', type: 'ENUM(OFAC, ONU, EU...) ', key: '', desc: 'Origem da lista internacional' },
        { name: 'nome_completo', type: 'VARCHAR(255)', key: 'FULLTEXT', desc: 'Nome do sancionado com índice Fulltext' },
        { name: 'aliases', type: 'TEXT', key: 'FULLTEXT', desc: 'Nomes alternativos para matching fonético' },
        { name: 'tipo', type: 'ENUM(INDIVIDUAL, ENTITY)', key: '', desc: 'Indivíduo ou Entidade/Navio/Aeronave' },
        { name: 'programa_sancao', type: 'VARCHAR(255)', key: '', desc: 'Ex: CAATSA, IRAN, SDNT, TERRORISM' }
      ]
    },
    {
      name: 'peps_cadastro',
      desc: 'Pessoas Expostas Politicamente (CGU, TSE, SISCOAF)',
      recordEstimate: '~100.000 Registros Ativos',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', desc: 'Identificador do PEP' },
        { name: 'cpf_limpo', type: 'VARCHAR(11)', key: 'INDEX', desc: 'CPF do agente público' },
        { name: 'nome_pep', type: 'VARCHAR(255)', key: 'INDEX', desc: 'Nome completo' },
        { name: 'cargo_funcao', type: 'VARCHAR(255)', key: '', desc: 'Presidente, Ministro, Deputado, Diretor' },
        { name: 'orgao_entidade', type: 'VARCHAR(255)', key: '', desc: 'Câmara, Senado, Petrobras, Caixa' },
        { name: 'grau_relacionamento', type: 'VARCHAR(50)', key: '', desc: 'Titular, Cônjuge, Filho, Sócio Estreito' }
      ]
    },
    {
      name: 'transacoes_kyt',
      desc: 'Log de Transações Financeiras Monitoradas & Alertas',
      recordEstimate: 'Milhões de Eventos / Particionado',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'UUID ou Hash único da transação' },
        { name: 'data_hora', type: 'DATETIME', key: 'INDEX', desc: 'Timestamp exato' },
        { name: 'origem_doc', type: 'VARCHAR(14)', key: 'INDEX', desc: 'CPF/CNPJ do emissor' },
        { name: 'destino_doc', type: 'VARCHAR(14)', key: 'INDEX', desc: 'CPF/CNPJ do beneficiário' },
        { name: 'valor', type: 'DECIMAL(15,2)', key: '', desc: 'Valor monetário da operação' },
        { name: 'score_risco', type: 'INT', key: '', desc: 'Score de 0 a 100 calculado pelo motor' },
        { name: 'status', type: 'ENUM(...)', key: 'INDEX', desc: 'LIBERADA, BLOQUEADA, REPORTADA_COAF' }
      ]
    }
  ];

  const currentTable = tables.find(t => t.name === selectedTable) || tables[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Arquitetura de Dados MySQL 8.0+ Otimizada</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Modelagem do Banco de Dados & Pipeline ETL
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Schema relacional completo pronto para carregar e indexar os mais de 
            <strong> 55 milhões de CNPJs da Receita Federal</strong>, os dados de sanções da 
            <strong> CGU (CEIS/CNEP)</strong>, as listas da <strong>OFAC/ONU</strong> e a esteira de 
            <strong> transações KYT</strong> com alta velocidade e suporte a queries em milissegundos.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Main Grid: Interactive Tables + Live Connection Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Table Explorer */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Table className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Estrutura das Tabelas do Schema
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>

              <button
                onClick={handleDownloadSql}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar .sql</span>
              </button>
            </div>
          </div>

          {/* Table Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {tables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  selectedTable === t.name
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Table Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div>
                <span className="font-mono font-bold text-white text-sm">{currentTable.name}</span>
                <p className="text-slate-400 mt-0.5">{currentTable.desc}</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[11px]">
                Volumetria: {currentTable.recordEstimate}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Coluna</th>
                    <th className="p-3">Tipo MySQL</th>
                    <th className="p-3">Chave / Índice</th>
                    <th className="p-3">Finalidade no Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {currentTable.columns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-200">{col.name}</td>
                      <td className="p-3 text-cyan-400 text-[11px]">{col.type}</td>
                      <td className="p-3">
                        {col.key === 'PK' ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                            PRIMARY
                          </span>
                        ) : col.key === 'FK' ? (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                            FOREIGN
                          </span>
                        ) : col.key === 'INDEX' ? (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                            INDEX
                          </span>
                        ) : col.key === 'FULLTEXT' ? (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                            FULLTEXT
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-3 font-sans text-slate-300 text-[11px]">{col.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Connection Tester & ETL Fast Track */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live MySQL Tester */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Testar Conexão com seu MySQL
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Insira os dados do seu servidor MySQL (local, AWS RDS, GCP Cloud SQL ou VPS) para testar a conectividade em tempo real.
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-slate-400 font-medium block mb-1">Host / IP</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                    placeholder="localhost ou IP"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Porta</label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Usuário</label>
                  <input
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Nome do Banco de Dados</label>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {testingConnection ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Testar Conexão Imediata</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                {testResult.serverInfo && (
                  <p className="font-mono text-[11px] text-slate-300">
                    Versão MySQL: {JSON.stringify(testResult.serverInfo)}
                  </p>
                )}
                {testResult.tip && (
                  <p className="text-[11px] text-amber-200/80 mt-1">{testResult.tip}</p>
                )}
              </div>
            )}
          </div>

          {/* ETL Ingestion Fast Track (Guia de Carga Rápida da Receita Federal) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Carga em Massa (55M CNPJs em 15 min)
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Para importar os arquivos gigantes da Receita Federal (CSVs com encoding Latin-1), <strong>nunca utilize INSERTs linha a linha</strong>. Use o comando nativo <code className="text-cyan-300 font-mono">LOAD DATA LOCAL INFILE</code>:
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto space-y-1">
              <div>LOAD DATA LOCAL INFILE '/dados/estabelecimentos.csv'</div>
              <div>INTO TABLE empresas_cnpj</div>
              <div>CHARACTER SET latin1</div>
              <div>FIELDS TERMINATED BY ';' OPTIONALLY ENCLOSED BY '"'</div>
              <div>LINES TERMINATED BY '\r\n'</div>
              <div>IGNORE 1 LINES;</div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400">
              <p>
                <strong>Dica de Otimização:</strong> Desative as chaves antes da carga (<code className="text-slate-300">ALTER TABLE empresas_cnpj DISABLE KEYS;</code>) e reative ao término para ganho de até 12x em velocidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
