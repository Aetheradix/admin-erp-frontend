export type AuthMode = 'PASSWORD' | 'OTP';

export interface LoginFormValues {
  email: string;
  password?: string;
  otp?: string;
}
