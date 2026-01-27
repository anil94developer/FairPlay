export interface AuthResponse {
  data?: any;
  status?: number;
  message?: string;
  [key: string]: any;
}

export default AuthResponse;
