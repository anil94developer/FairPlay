export interface SupportContact {
  type: string;
  value: string;
  label?: string;
}

export interface DomainConfig {
  demoUser: boolean;
  signup: boolean;
  whatsapp: boolean;
  payments: boolean;
  bonus: boolean;
  affiliate: boolean;
  depositWagering: boolean;
  suppportContacts: SupportContact[] | null;
  apkUrl: string | null;
  b2cEnabled: boolean;
  ruleScope: string;
}

export default DomainConfig;
