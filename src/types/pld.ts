export interface QsaPartner {
  nome_socio?: string;
  nome?: string;
  cnpj_cpf_do_socio?: string;
  qualificacao_socio?: string;
  qualificacao_representante_legal?: string;
  faixa_etaria?: string;
  hasSanction?: boolean;
  isPep?: boolean;
  sanctions?: any[];
  pepDetails?: any[];
}

export interface CompanyData {
  cnpj: string;
  cnpj_formatado?: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral: string;
  data_situacao_cadastral?: string;
  data_inicio_atividade?: string;
  cnae_fiscal?: number | string;
  cnae_fiscal_descricao?: string;
  capital_social?: number;
  porte?: string;
  natureza_juridica?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  cnaes_secundarios?: Array<{ codigo: number; descricao: string }>;
  qsa?: QsaPartner[];
}

export interface EvaluationResult {
  riskScore: number;
  riskLevel: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  recommendation: string;
  flags: string[];
  sanctionsFound: any[];
  pepsFound: any[];
  highRiskCnaesFound: any[];
  auditLogId: string;
  analyzedAt: string;
}

export interface KytTransaction {
  id: string;
  txId?: string;
  dataHora: string;
  origemDoc: string;
  origemNome: string;
  destinoDoc: string;
  destinoNome: string;
  valor: number;
  metodoPagamento: 'PIX' | 'TED' | 'CRIPTO' | 'ESPECIE' | 'BOLETO';
  paisDestino?: string;
  scoreRisco: number;
  status: 'LIBERADA' | 'EM_ANALISE_MANUAL' | 'BLOQUEADA' | 'REPORTADA_COAF';
  regrasVioladas: Array<{ code: string; rule: string; weight: number; severity: 'ALERTA' | 'GRAVE' | 'CRITICO' }>;
  siscoafMandatory?: boolean;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  targetType: 'CNPJ' | 'CPF' | 'TRANSACTION' | 'PEP' | 'BATCH';
  targetValue: string;
  riskScore: number;
  riskLevel: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  flags: string[];
  operator: string;
  source: string;
  notes?: string;
}
