import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface Tap {
  id: string;
  title: string;
  category: string;
  material?: string;
  flow_rate?: string;
  description: string;
  image_url: string;

  container_type?: string;
  size?: string;
  liquid_type?: string;
}

export interface User {
  email: string;
  role: 'user' | 'admin' | 'SuperAdmin';
  created_at: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  role: 'user' | 'admin' | 'SuperAdmin';
  email: string;
  expiresIn: number; 
}


// Response types
interface GetTapsResponse {
  taps: Tap[];
}

interface DeleteTapResponse {
  message: string;
}

interface CreateTapResponse {
  success: boolean;
  tapId: string;
  message: string;
  tap: Tap;
}

interface UpdateTapResponse {
  success: boolean;
  message: string;
  tap: Tap;
}

interface GetUsersResponse {
  users: User[];
}

interface UpdateUserRoleResponse {
  success: boolean;
  message: string;
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export const adminAPI = {
  getTaps: async (token: string): Promise<Tap[]> => {
    const res = await axios.get<GetTapsResponse>(`${API_URL}/taps`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.taps;
  },

  deleteTap: async (token: string, id: string): Promise<DeleteTapResponse> => {
    const res = await axios.delete<DeleteTapResponse>(`${API_URL}/taps/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getTapById: async (token: string, id: string): Promise<Tap> => {
    const res = await axios.get<{ tap: Tap }>(`${API_URL}/taps/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.tap;
  },

  createTap: async (token: string, formData: FormData): Promise<CreateTapResponse> => {
    const res = await axios.post<CreateTapResponse>(`${API_URL}/taps`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateTap: async (token: string, id: string, formData: FormData): Promise<UpdateTapResponse> => {
    const res = await axios.put<UpdateTapResponse>(`${API_URL}/taps/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  loginUser: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });
    return res.data;
  },

  getUsers: async (token: string): Promise<User[]> => {
    const res = await axios.get<GetUsersResponse>(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.users;
  },

  updateUserRole: async (token: string, email: string, newRole: string): Promise<UpdateUserRoleResponse> => {
    const res = await axios.put<UpdateUserRoleResponse>(
      `${API_URL}/update-role`,
      { email, newRole },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  deleteUser: async (token: string, email: string): Promise<DeleteUserResponse> => {
    const res = await axios.delete<DeleteUserResponse>(`${API_URL}/delete-user/${email}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  registerUser: async (email: string, password: string): Promise<RegisterResponse> => {
    const res = await axios.post<RegisterResponse>(`${API_URL}/register`, { email, password });
    return res.data;
  },
};
