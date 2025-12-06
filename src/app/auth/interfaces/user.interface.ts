export interface User {
  id: string;
  name: string;
  email: string;
  role: 'distributor' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}
