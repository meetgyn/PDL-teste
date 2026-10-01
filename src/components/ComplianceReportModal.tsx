import React from 'react';
import { X, Printer, ShieldCheck, Download, Award, FileText, CheckCircle2 } from 'lucide-react';
import { CompanyData, EvaluationResult } from '../types/pld';

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
  if (!isOpen || !data) return null;

  const { company, evaluation } = data;

  const handlePrint = () => {
    window.print();
  };

  const sha256Simulated = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.slice(0, 40);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Actions Bar (hidden when printing) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Visualização de Dossiê de Compliance & PLD
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Dossier Content */}
        <div className="p-8 overflow-y-auto bg-slate-900 text-slate-200 space-y-6 printable-area">
          {/* Header */}
          <div className="border-b-2 border-slate-700 pb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white tracking-wide uppercase">
                    Dossiê Formal de Compliance PLD/CFT
                  </h1>
                  <p className="text-xs text-slate-400">
                    Prevenção à Lavagem de Dinheiro e Financiamento do Terrorismo
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Em conformidade com a <strong>Circular BACEN nº 3.978/2020</strong> e <strong>Lei nº 9.613/1998</strong>
              </p>
            </div>

            <div className="text-right text-xs space-y-1 font-mono">
              <div>
                <span className="text-slate-400">Emissão: </span>
                <span className="text-white font-bold">{new Date().toLocaleString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-slate-400">Protocolo: </span>
                <span className="text-blue-400 font-bold">{evaluation.auditLogId}</span>
              </div>
              <div>
                <span className="text-slate-400">Hash SHA-256: </span>
                <span className="text-slate-400 text-[10px]">{sha256Simulated}...</span>
              </div>
            </div>
          </div>

          {/* Target Entity Overview */}
          <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Identificação da Entidade Analisada (Pessoa Jurídica)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Razão Social</span>
                <span className="font-bold text-white block mt-0.5">{company.razao_social}</span>
              </div>
              <div>
                <span className="text-slate-500 block">CNPJ</span>
                <span className="font-mono font-bold text-white block mt-0.5">
                  {company.cnpj_formatado || company.cnpj}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Situação Cadastral</span>
                <span className="font-bold text-emerald-400 block mt-0.5">
                  {company.situacao_cadastral}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Capital Social</span>
                <span className="font-mono font-bold text-white block mt-0.5">
                  {Number(company.capital_social || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-500 block">Atividade Econômica Principal (CNAE):</span>
              <span className="text-slate-300 font-medium">
                {company.cnae_fiscal} - {company.cnae_fiscal_descricao}
              </span>
            </div>
          </div>

          {/* Risk Evaluation Matrix */}
          <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Avaliação de Risco & Parecer Conclusivo
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  evaluation.riskLevel === 'CRITICO'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : evaluation.riskLevel === 'ALTO'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                CLASSIFICAÇÃO: {evaluation.riskLevel} (SCORE {evaluation.riskScore}/100)
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
              <strong>Decisão Regulatória Recomendada:</strong> {evaluation.recommendation}
            </div>

            {evaluation.flags.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">
                  Fatores de Risco Identificados:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {evaluation.flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* QSA Partners */}
          <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Quadro Societário & Beneficiários Finais (UBO)
            </h2>
            <div className="space-y-2">
              {(company.qsa || []).map((partner, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">
                      {partner.nome_socio || partner.nome}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {partner.qualificacao_socio} | Doc: {partner.cnpj_cpf_do_socio}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {partner.isPep && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                        PEP
                      </span>
                    )}
                    {partner.hasSanction && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                        SANCIONADO
                      </span>
                    )}
                    {!partner.isPep && !partner.hasSanction && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                        Regular
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-800 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-slate-600 w-3/4 mx-auto mb-2"></div>
              <p className="font-bold text-white">Analista de Compliance / PLD</p>
              <p className="text-slate-500 text-[11px]">Assinatura Digital Verificada</p>
            </div>
            <div>
              <div className="border-b border-slate-600 w-3/4 mx-auto mb-2"></div>
              <p className="font-bold text-white">Diretoria de Risco & Integridade</p>
              <p className="text-slate-500 text-[11px]">Aprovação / Homologação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
