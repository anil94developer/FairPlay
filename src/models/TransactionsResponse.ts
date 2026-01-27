export interface TransactionsResponse {
  id?: string | number;
  transactionId?: string;
  type?: string;
  status?: string;
  amount?: number;
  currency?: string;
  createdAt?: string | number;
  updatedAt?: string | number;
  [key: string]: any;
}

export default TransactionsResponse;
