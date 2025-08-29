export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface UserCreationResponse {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    role: string;
  };
}

export interface EdgeFunctionResponse {
  data?: {
    user: {
      id: string;
      email: string;
    };
  };
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}