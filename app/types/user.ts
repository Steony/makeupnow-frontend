

export type Role = 'ADMIN' | 'PROVIDER' | 'CLIENT'; 

export interface User {
  id: string | number;
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  phoneNumber: string;
  role: Role;
  isActive: boolean;
}
