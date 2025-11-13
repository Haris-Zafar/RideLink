import { create } from 'zustand';
import { authAPI } from '@api/auth';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  // Register
  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.register(userData);
      toast.success(response.message || 'Registration successful!');
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  },

  // Login
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success('Welcome back!');
      return response;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
      
      toast.success('Logged out successfully');
    }
  },

  // Check authentication status
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return false;
    }

    try {
      const response = await authAPI.getMe();
      set({
        user: response.data,
        isAuthenticated: true,
      });
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
      return false;
    }
  },

  // Update user in state
  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));

export default useAuthStore;