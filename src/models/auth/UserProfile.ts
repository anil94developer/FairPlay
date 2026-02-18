/**
 * User profile from /user/userLogin API response (data field)
 */
export interface UserProfile {
  _id: string;
  parent_id: string;
  user_type_id: number;
  name: string;
  user_name: string;
  is_change_password: number;
  exposure_limit: number;
  point: number;
  domain_id: string;
  is_demo: boolean;
  is_telegram_enable: number;
  rule_accept: number;
  is_signup_by_otpless: boolean;
  mobile: string | null;
  country_code: string;
}
