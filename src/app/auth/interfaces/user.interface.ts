export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type DocumentType = 'CC' | 'CE' | 'NIT' | 'TI' | 'PAS';

export interface CustomerRegistration {
  email: string;
  name: string;
  phone: string;
  documentType: DocumentType;
  documentNumber: string;
}

export interface Customer {
  id: string;
  email: string;
  phone: string;
  name: string;
  documentType: string;
  documentNumber: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  customer?: Customer | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse extends User {
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface LogoutResponse {
  ok: true;
}

export interface RegisterPayload {
  email: string;
  password: string;
  customer?: CustomerRegistration;
}

export interface RequestPasswordRecoveryPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateCustomerProfilePayload {
  email?: string;
  phone?: string;
}
