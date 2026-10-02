import React from 'react';
import { X, Printer, ShieldCheck, FileText } from 'lucide-react';
import { CompanyData, EvaluationResult } from '../types/pld';
import { useTheme } from '../context/ThemeContext';

interface ComplianceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    company: CompanyData;
    evaluation: EvaluationResult;
  } | null;
}

export const ComplianceReportModal: React.FC<ComplianceReportModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen || !data) return null;

  const { company, evaluation } = data;

  const handlePrint = () => {
    window.print();
  };

  const sha256Simulated = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.slice(0, 40);

  const modalBg = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const subBoxBg = isDark
    ? 'bg-slate-950/80 border-slate-800 text-slate-200'
    : 'bg-slate-50 border-slate-200 text-slate-800';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`border rounded-xl max-w-4xl w-full shadow-xl overflow-hidden flex flex-col max-h-[90vh] ${modalBg}`}>
        {/* Modal Actions Bar (hidden when printing) */}
        <div className={`p-4 border-b flex items-center justify-between no-print ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dossiê de Conformidade PLD / CFT
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Dossier Content */}
        <div className="p-8 overflow-y-auto space-y-6 printable-area">
          {/* Header */}
          <div className="border-b pb-5 flex flex-wrap items-start justify-between gap-4 border-slate-700">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-wide uppercase">
                    Dossiê de Compliance PLD/CFT
                  </h1>
                  <p className="text-xs text-slate-500">
                    Prevenção à Lavagem de Dinheiro e Financiamento do Terrorismo
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Em conformidade com a <strong>Circular BACEN nº 3.978/2020</strong> e <strong>Lei nº 9.613/1998</strong>
              </p>
            </div>

            <div className="text-right text-xs space-y-0.5 font-mono">
              <div>
                <span className="text-slate-500">Emissão: </span>
                <span className="font-bold">{new Date().toLocaleString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-slate-500">Protocolo: </span>
                <span className="font-bold">{evaluation.auditLogId}</span>
              </div>
              <div>
                <span className="text-slate-500">Hash SHA-256: </span>
                <span className="text-[10px] text-slate-500">{sha256Simulated}...</span>
              </div>
            </div>
          </div>

          {/* Target Entity Overview */}
          <div className={`rounded-xl p-5 border space-y-3 ${subBoxBg}`}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Identificação da Entidade Analisada
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Razão Social</span>
                <span className="font-bold block mt-0.5">{company.razao_social}</span>
              </div>
              <div>
                <span className="text-slate-500 block">CNPJ</span>
                <span className="font-mono font-bold block mt-0.5">
                  {company.cnpj_formatado || company.cnpj}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Situação Cadastral</span>
                <span className="font-bold block mt-0.5">{company.situacao_cadastral}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Capital Social</span>
                <span className="font-mono font-bold block mt-0.5">
                  {Number(company.capital_social || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Evaluation Matrix */}
          <div className={`rounded-xl p-5 border space-y-3 ${subBoxBg}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Avaliação de Risco & Parecer Conclusivo
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-bold border border-slate-600">
                CLASSIFICAÇÃO: {evaluation.riskLevel} (SCORE {evaluation.riskScore}/100)
              </span>
            </div>

            <div className={`p-3 rounded-lg border text-xs ${modalBg}`}>
              <strong>Decisão Regulatória Recomendada:</strong> {evaluation.recommendation}
            </div>

            {evaluation.flags.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">
                  Fatores de Risco Identificados:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  {evaluation.flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* QSA Partners */}
          <div className={`rounded-xl p-5 border space-y-3 ${subBoxBg}`}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Quadro Societário & Beneficiários Finais (UBO)
            </h2>
            <div className="space-y-1.5">
              {(company.qsa || []).map((partner, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${modalBg}`}
                >
                  <div>
                    <span className="font-bold block">{partner.nome_socio || partner.nome}</span>
                    <span className="text-slate-500 text-[11px]">
                      {partner.qualificacao_socio} | Doc: {partner.cnpj_cpf_do_socio}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {partner.isPep && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-500 text-amber-500">
                        PEP
                      </span>
                    )}
                    {partner.hasSanction && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-rose-500 text-rose-500">
                        SANÇÃO
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-700 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-slate-500 w-3/4 mx-auto mb-2"></div>
              <p className="font-bold">Analista de Compliance / PLD</p>
              <p className="text-slate-500 text-[11px]">Assinatura Digital</p>
            </div>
            <div>
              <div className="border-b border-slate-500 w-3/4 mx-auto mb-2"></div>
              <p className="font-bold">Diretoria de Risco & Integridade</p>
              <p className="text-slate-500 text-[11px]">Homologação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
