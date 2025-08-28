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