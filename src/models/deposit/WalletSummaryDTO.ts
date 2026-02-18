export interface WalletSummaryItemDTO {
  _id: string;
  parent_user_name: string;
  user_name: string;
  images: string;
  reference_no: string;
  description: string;
  remark: string;
  statement_type: string;
  amount: number;
  payment_deatails: Array<{
    _id: string;
    method_id: string;
    method_name: string;
    bank_holder_name: string;
    others: string;
    crypto_coin_type?: string;
    crypto_wallet?: string;
  }>;
  status: string;
  self_host: boolean;
  generated_at: string;
}

export interface WalletSummaryResponseDTO {
  total: number;
  totalexposure?: Array<{ _id: string | null; total: number }>;
  getData: WalletSummaryItemDTO[];
}
