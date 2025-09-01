import { create } from 'zustand';

interface AdminCredentials {
  username: string;
  password: string;
}

interface AdminCredentialsStore {
  credentials: AdminCredentials | null;
  setCredentials: (credentials: AdminCredentials | null) => void;
}

export const useAdminCredentialsStore = create<AdminCredentialsStore>((set) => ({
  credentials: null,
  setCredentials: (credentials) => set({ credentials })
}));