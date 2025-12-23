export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
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
