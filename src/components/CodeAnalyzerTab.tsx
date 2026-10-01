import React, { useState } from 'react';
import {
  FileCode,
  Upload,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Cpu,
  ArrowRight,
  Database,
  ShieldCheck,
  Send,
  Code
} from 'lucide-react';

export const CodeAnalyzerTab: React.FC = () => {
  const [userCode, setUserCode] = useState(`-- Cole aqui o seu código (SQL, Python, Node.js, PHP, scripts de automação, etc.)
-- O analisador do Sentinela verificará a compatibilidade com o MySQL e as regras do BACEN 3.978.

SELECT 
    e.cnpj,
    e.razao_social,
    s.nome_socio,
    s.is_pep,
    c.cadastro AS sancao_ativa
FROM empresas_cnpj e
LEFT JOIN socios_qsa s ON e.cnpj = s.cnpj
LEFT JOIN sancoes_cgu c ON e.cnpj = c.documento_limpo
WHERE e.cnpj = '04123456000178';
`);

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Ready-to-test code presets
  const samplePresets = [
    {
      title: 'Exemplo: Script Python de Carga da Receita Federal (ZIP)',
      code: `import os
import zipfile
import pandas as pd
import pymysql

# Download dos arquivos mensais da Receita Federal
# https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica-cnpj

def process_receita_zip(zip_path):
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='pld_kyt_db',
        charset='utf8mb4'
    )
    with zipfile.ZipFile(zip_path, 'r') as z:
        for filename in z.namelist():
            if 'ESTABELE' in filename:
                # Processamento em lotes para evitar estouro de memória RAM
                for chunk in pd.read_csv(z.open(filename), sep=';', encoding='latin1', chunksize=50000, header=None):
                    # Inserção em massa no MySQL
                    chunk.to_sql('empresas_cnpj', con=conn, if_exists='append', index=False)
`
    },
    {
      title: 'Exemplo: Client Node.js / TypeScript para API da CGU (CEIS/CNEP)',
      code: `import fetch from 'node-fetch';

interface CGUSanctionResponse {
  id: number;
  dataInicioSancao: string;
  motivo: string;
  sancionado: {
    codigoFormatado: string;
    nome: string;
  };
}

export async function checkCEIS(cnpj: string, cguToken: string): Promise<CGUSanctionResponse[]> {
  const clean = cnpj.replace(/\\D/g, '');
  const url = \`https://api.portaldatransparencia.gov.br/api-de-dados/ceis?cnpjSancionado=\${clean}&pagina=1\`;
  
  const response = await fetch(url, {
    headers: {
      'chave-api-dados': cguToken,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(\`Falha na API da CGU: \${response.statusText}\`);
  }

  return response.json();
}
`
    },
    {
      title: 'Exemplo: Query SQL de Cruzamento de Doadores TSE com Sócios',
      code: `SELECT 
    q.cnpj,
    q.nome_socio,
    t.nome_candidato,
    t.partido,
    t.cargo_candidato,
    t.valor_doado,
    t.ano_eleicao
FROM socios_qsa q
INNER JOIN tse_doacoes t 
    ON q.nome_socio = t.nome_doador
WHERE t.valor_doado > 10000
ORDER BY t.valor_doado DESC;
`
    }
  ];

  const handleAnalyze = async () => {
    if (!userCode.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/code/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: userCode })
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setUserCode(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Central de Integração & Análise de Código</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Envie Seus Códigos, Scripts e Consultas
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Como você mencionou que tem scripts ou implementações prontas, cole ou envie seus arquivos aqui!
            Nossa engine analisa a <strong>performance no MySQL</strong>, sugere <strong>índices ideais</strong>, 
            mapeia para o schema do Sentinela e valida a conformidade com as regras do <strong>BACEN Circular 3.978</strong>.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Upload */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Editor de Código & Scripts
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Carregar Arquivo (.sql, .py, .ts, .js)</span>
                <input
                  type="file"
                  accept=".sql,.py,.ts,.js,.php,.json,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Quick template selection */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium">Ou escolha um modelo para testar:</span>
            <div className="flex flex-wrap gap-1.5">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserCode(preset.code)}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Code Textarea */}
          <div className="relative">
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              rows={16}
              className="w-full p-4 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 leading-relaxed resize-y"
              placeholder="Cole seu código aqui..."
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                <span>Executar Diagnóstico Técnico & Mapeamento MySQL</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Diagnostic & Integration Output */}
        <div className="lg:col-span-5 space-y-6">
          {analysisResult ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Relatório de Análise Técnica
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs">
                  {analysisResult.languageDetected}
                </span>
              </div>

              {/* Strengths */}
              {analysisResult.strengths?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Pontos Fortes Identificados:</span>
                  </span>
                  <div className="space-y-1.5">
                    {analysisResult.strengths.map((str: string, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-200"
                      >
                        {str}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {analysisResult.improvements?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Otimizações Críticas Recomendadas:</span>
                  </span>
                  <div className="space-y-1.5">
                    {analysisResult.improvements.map((imp: string, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-xs text-amber-200"
                      >
                        {imp}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MySQL Mapping */}
              {analysisResult.mysqlMapping?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>Mapeamento com Tabelas do Schema Sentinela:</span>
                  </span>
                  <div className="space-y-1.5">
                    {analysisResult.mysqlMapping.map((map: string, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/40 text-xs text-blue-200 font-mono"
                      >
                        {map}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance Warnings */}
              {analysisResult.complianceWarnings?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Diretrizes Regulatórias (BACEN / LGPD):</span>
                  </span>
                  <div className="space-y-1.5">
                    {analysisResult.complianceWarnings.map((war: string, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-900/40 text-xs text-purple-200"
                      >
                        {war}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next step recommendation */}
              {analysisResult.recommendedNextStep && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-white flex items-center space-x-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Próximo Passo Recomendado:</span>
                  </span>
                  <p className="text-slate-300">{analysisResult.recommendedNextStep}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <FileCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Pronto para Analisar</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Envie seus scripts ou selecione um dos exemplos acima e clique em "Executar Diagnóstico Técnico" para ver a compatibilidade imediata com o seu banco MySQL.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
