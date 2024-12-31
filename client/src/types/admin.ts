
export interface Role {
    id: number;
    name: string;
    userCount: number;
  }
  
  export interface User {
    id: number;
    name: string;
    role: string;
    isActive: boolean;
  }
  