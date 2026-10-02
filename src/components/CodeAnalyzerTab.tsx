import React, { useState } from 'react';
import {
  FileCode,
  Upload,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Database,
  ShieldCheck,
  Code
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const CodeAnalyzerTab: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  const samplePresets = [
    {
      title: 'Script Python de Carga da Receita Federal (ZIP)',
      code: `import os
import zipfile
import pandas as pd
import pymysql

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
                for chunk in pd.read_csv(z.open(filename), sep=';', encoding='latin1', chunksize=50000, header=None):
                    chunk.to_sql('empresas_cnpj', con=conn, if_exists='append', index=False)
`
    },
    {
      title: 'Client Node.js para API da CGU (CEIS/CNEP)',
      code: `import fetch from 'node-fetch';

export async function checkCEIS(cnpj: string, cguToken: string) {
  const clean = cnpj.replace(/\\D/g, '');
  const url = \`https://api.portaldatransparencia.gov.br/api-de-dados/ceis?cnpjSancionado=\${clean}&pagina=1\`;
  
  const response = await fetch(url, {
    headers: {
      'chave-api-dados': cguToken,
      'Accept': 'application/json'
    }
  });

  return response.json();
}
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
              Diagnóstico de Código
            </span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Integração MySQL & Regulação
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Análise e Integração do Seu Código
          </h1>
          <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Cole ou carregue seus scripts existentes (Python, Node.js, SQL, PHP) para validação de performance no MySQL e conformidade com o <strong>BACEN Circular 3.978</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Upload */}
        <div className={`lg:col-span-7 border rounded-xl p-5 space-y-4 ${cardClass}`}>
          <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Editor de Código & Scripts
              </h2>
            </div>

            <label className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}>
              <Upload className="w-3.5 h-3.5" />
              <span>Carregar Arquivo</span>
              <input
                type="file"
                accept=".sql,.py,.ts,.js,.php,.json,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <div className="space-y-1.5 text-xs">
            <span className="text-slate-500 font-medium">Modelos de teste:</span>
            <div className="flex flex-wrap gap-1.5">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserCode(preset.code)}
                  className={`px-2 py-0.5 rounded text-[11px] border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            rows={14}
            className={`w-full p-3 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed resize-y border ${inputClass}`}
            placeholder="Cole seu código aqui..."
          />

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
                <Cpu className="w-3.5 h-3.5" />
                <span>Executar Diagnóstico Técnico</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Diagnostic Output */}
        <div className="lg:col-span-5 space-y-4">
          {analysisResult ? (
            <div className={`border rounded-xl p-5 space-y-4 animate-in fade-in ${cardClass}`}>
              <div className={`flex items-center justify-between border-b pb-3 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Resultado do Diagnóstico
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {analysisResult.languageDetected}
                </span>
              </div>

              {analysisResult.strengths?.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Pontos Fortes:</span>
                  </span>
                  {analysisResult.strengths.map((str: string, i: number) => (
                    <div key={i} className={`p-2 rounded border ${subCardClass}`}>
                      {str}
                    </div>
                  ))}
                </div>
              )}

              {analysisResult.improvements?.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Otimizações Recomendadas:</span>
                  </span>
                  {analysisResult.improvements.map((imp: string, i: number) => (
                    <div key={i} className={`p-2 rounded border ${subCardClass}`}>
                      {imp}
                    </div>
                  ))}
                </div>
              )}

              {analysisResult.mysqlMapping?.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                    <Database className="w-3.5 h-3.5" />
                    <span>Mapeamento MySQL:</span>
                  </span>
                  {analysisResult.mysqlMapping.map((map: string, i: number) => (
                    <div key={i} className={`p-2 rounded border font-mono text-[11px] ${subCardClass}`}>
                      {map}
                    </div>
                  ))}
                </div>
              )}

              {analysisResult.recommendedNextStep && (
                <div className={`p-3 rounded-lg border text-xs space-y-1 ${subCardClass}`}>
                  <span className="font-bold flex items-center space-x-1 text-slate-400">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Próximo Passo:</span>
                  </span>
                  <p>{analysisResult.recommendedNextStep}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`border rounded-xl p-8 text-center space-y-2 ${cardClass}`}>
              <FileCode className="w-8 h-8 mx-auto text-slate-400" />
              <h3 className="text-sm font-bold">Pronto para Analisar</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Insira ou selecione um script e clique em "Executar Diagnóstico Técnico" para ver a compatibilidade com o MySQL.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
