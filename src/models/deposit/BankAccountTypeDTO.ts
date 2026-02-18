export interface BankAccountTypeDTO {
  _id: string;
  user_id: string;
  user_name: string;
  parent_id: string;
  parent_name: string;
  payment_type: string;
  name: string;
  category: string;
  image: string;
  content_meta?: { filename: string; identifier: string };
  self_host: boolean;
  status: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
