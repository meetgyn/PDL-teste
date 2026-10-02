import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  Copy,
  Check,
  Download,
  HardDrive,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Terminal
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const DatabaseSchemaTab: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  const tables = [
    {
      name: 'empresas_cnpj',
      desc: 'Base de PJs da Receita Federal enriquecida via BrasilAPI',
      recordEstimate: '55+ Milhões (RFB)',
      columns: [
        { name: 'cnpj', type: 'VARCHAR(14)', key: 'PK', desc: 'Chave primária sem formatação' },
        { name: 'razao_social', type: 'VARCHAR(255)', key: 'INDEX', desc: 'Razão social oficial' },
        { name: 'situacao_cadastral', type: 'VARCHAR(50)', key: 'INDEX', desc: 'ATIVA, BAIXADA, INAPTA' },
        { name: 'cnae_fiscal_principal', type: 'VARCHAR(10)', key: 'INDEX', desc: 'CNAE de risco setorial' },
        { name: 'capital_social', type: 'DECIMAL(15,2)', key: '', desc: 'Capital registrado' },
        { name: 'uf', type: 'CHAR(2)', key: 'INDEX', desc: 'Unidade Federativa' }
      ]
    },
    {
      name: 'socios_qsa',
      desc: 'Quadro Societário e Administradores (UBO - Beneficiário Final)',
      recordEstimate: '28+ Milhões (RFB)',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', desc: 'Identificador do vínculo' },
        { name: 'cnpj', type: 'VARCHAR(14)', key: 'FK', desc: 'Chave da empresa investigada' },
        { name: 'nome_socio', type: 'VARCHAR(255)', key: 'INDEX', desc: 'Nome completo do sócio' },
        { name: 'cnpj_cpf_socio', type: 'VARCHAR(14)', key: 'INDEX', desc: 'CPF ou CNPJ do sócio' },
        { name: 'is_pep', type: 'BOOLEAN', key: 'INDEX', desc: 'Flag de exposição política' },
        { name: 'is_sancionado', type: 'BOOLEAN', key: 'INDEX', desc: 'Flag de sanção em lista' }
      ]
    },
    {
      name: 'sancoes_cgu',
      desc: 'Cadastros Nacionais de Sanções (CEIS, CNEP, CEPIM, CEAF)',
      recordEstimate: '~120.000 Registros',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', desc: 'ID da sanção' },
        { name: 'cadastro', type: 'ENUM(CEIS, CNEP...)', key: 'INDEX', desc: 'Cadastro oficial da CGU' },
        { name: 'documento_limpo', type: 'VARCHAR(14)', key: 'INDEX', desc: 'CPF ou CNPJ sancionado' },
        { name: 'nome_sancionado', type: 'VARCHAR(255)', key: 'INDEX', desc: 'Razão social ou nome' },
        { name: 'orgao_sancionador', type: 'VARCHAR(255)', key: '', desc: 'Ministério, TCU, CGU' }
      ]
    },
    {
      name: 'grafo_casos',
      desc: 'Knowledge Graph - Casos de Investigação de Vínculos',
      recordEstimate: 'Tabela do Seu MVP',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', desc: 'Identificador do caso' },
        { name: 'caso_codigo', type: 'VARCHAR(64)', key: 'UNIQUE', desc: 'Ex: PLD-2026-0042' },
        { name: 'entidade_alvo', type: 'VARCHAR(255)', key: '', desc: 'Nome da entidade investigada' },
        { name: 'pld_risk', type: 'INT', key: '', desc: 'Score de Risco PLD (0 a 100)' },
        { name: 'attribution_confidence', type: 'INT', key: '', desc: 'Força de atribuição (%)' },
        { name: 'evidence_confidence', type: 'INT', key: '', desc: 'Confiança probatória (%)' }
      ]
    },
    {
      name: 'grafo_nos',
      desc: 'Entidades e Nós do Grafo Interativo',
      recordEstimate: 'Nós do Grafo',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', desc: 'ID do nó' },
        { name: 'caso_id', type: 'BIGINT', key: 'FK', desc: 'Referência ao caso' },
        { name: 'node_key', type: 'VARCHAR(64)', key: 'INDEX', desc: 'root, partner_0, infra...' },
        { name: 'tipo', type: 'ENUM(...)', key: '', desc: 'ROOT, COMPANY, ASSET, RISK' },
        { name: 'label', type: 'VARCHAR(100)', key: '', desc: 'Rótulo exibido no nó' },
        { name: 'confianca_pct', type: 'INT', key: '', desc: 'Percentual de atribuição' }
      ]
    },
    {
      name: 'transacoes_kyt',
      desc: 'Eventos Transacionais Monitorados em Tempo Real',
      recordEstimate: 'Milhões de Eventos',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'UUID ou Hash único' },
        { name: 'data_hora', type: 'DATETIME', key: 'INDEX', desc: 'Data e hora da operação' },
        { name: 'origem_doc', type: 'VARCHAR(14)', key: 'INDEX', desc: 'CPF/CNPJ do emissor' },
        { name: 'destino_doc', type: 'VARCHAR(14)', key: 'INDEX', desc: 'CPF/CNPJ do favorecido' },
        { name: 'valor', type: 'DECIMAL(15,2)', key: '', desc: 'Valor da operação' },
        { name: 'status', type: 'ENUM(...)', key: 'INDEX', desc: 'LIBERADA, BLOQUEADA' }
      ]
    }
  ];

  const currentTable = tables.find(t => t.name === selectedTable) || tables[0];

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
              Arquitetura de Dados MySQL 8.0+
            </span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Otimizado para Alta Volumetria
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Modelagem do Banco de Dados & Pipeline ETL
          </h1>
          <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Schema relacional pronto para indexar os <strong>55+ milhões de CNPJs</strong>, sanções da 
            <strong> CGU (CEIS/CNEP)</strong>, as tabelas do seu <strong>Knowledge Graph</strong> e o monitoramento <strong>KYT</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Table Explorer */}
        <div className={`lg:col-span-7 border rounded-xl p-5 space-y-4 ${cardClass}`}>
          <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Table className="w-3.5 h-3.5 text-slate-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tabelas Relacionais do Schema
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopySql}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar DDL'}</span>
              </button>

              <button
                onClick={handleDownloadSql}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar .sql</span>
              </button>
            </div>
          </div>

          {/* Table Selector */}
          <div className="flex flex-wrap gap-1.5">
            {tables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer border ${
                  selectedTable === t.name
                    ? isDark
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-white border-slate-900'
                    : isDark
                    ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Table Details */}
          <div className="space-y-3">
            <div className={`p-3 rounded-lg border text-xs flex justify-between items-center ${subCardClass}`}>
              <div>
                <span className="font-mono font-bold block">{currentTable.name}</span>
                <p className={`mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{currentTable.desc}</p>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                {currentTable.recordEstimate}
              </span>
            </div>

            <div className={`overflow-x-auto rounded-lg border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <table className="w-full text-left text-xs">
                <thead className={`font-semibold border-b ${
                  isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <tr>
                    <th className="p-2.5">Coluna</th>
                    <th className="p-2.5">Tipo MySQL</th>
                    <th className="p-2.5">Chave</th>
                    <th className="p-2.5">Descrição</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                  {currentTable.columns.map((col, idx) => (
                    <tr key={idx} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                      <td className="p-2.5 font-bold">{col.name}</td>
                      <td className="p-2.5 text-slate-500 text-[11px]">{col.type}</td>
                      <td className="p-2.5">
                        {col.key ? (
                          <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${
                            col.key === 'PK'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {col.key}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-2.5 font-sans text-[11px]">{col.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Connection Tester & ETL Fast Track */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`border rounded-xl p-5 space-y-4 ${cardClass}`}>
            <div className={`flex items-center space-x-2 border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <Cpu className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Testar Conexão com seu MySQL
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-slate-500 block mb-1">Host / IP</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Porta</label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${inputClass}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1">Usuário</label>
                  <input
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${inputClass}`}
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Banco de Dados</label>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${inputClass}`}
                />
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className={`w-full py-2 font-semibold rounded-lg text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 ${
                isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {testingConnection ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Testar Conexão</span>
                </>
              )}
            </button>

            {testResult && (
              <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                testResult.success
                  ? isDark ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : isDark ? 'bg-amber-950/20 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <div className="flex items-center space-x-2 font-bold">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{testResult.message}</span>
                </div>
                {testResult.tip && <p className="text-[11px] opacity-80">{testResult.tip}</p>}
              </div>
            )}
          </div>

          {/* ETL Ingestion Fast Track */}
          <div className={`border rounded-xl p-5 space-y-3 ${cardClass}`}>
            <div className={`flex items-center space-x-2 border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <Terminal className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Carga em Massa (LOAD DATA INFILE)
              </h3>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Para carregar os arquivos da Receita Federal em minutos:
            </p>

            <div className={`p-3 rounded-lg border font-mono text-[11px] space-y-0.5 overflow-x-auto ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div>LOAD DATA LOCAL INFILE '/dados/estabelecimentos.csv'</div>
              <div>INTO TABLE empresas_cnpj</div>
              <div>CHARACTER SET latin1</div>
              <div>FIELDS TERMINATED BY ';' OPTIONALLY ENCLOSED BY '"'</div>
              <div>LINES TERMINATED BY '\r\n';</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
