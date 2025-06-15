// types/RegisterDTO.ts

export type Role = 'CUSTOMER' | 'PROVIDER'; // ADMIN exclu volontairement

export interface RegisterDTO {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
  role: Role;
}
