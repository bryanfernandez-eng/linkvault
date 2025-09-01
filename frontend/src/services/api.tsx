import axios from 'axios';
import { 
  DashboardData, 
  Link, 
  Section, 
  CreateLinkData, 
  UpdateLinkData, 
  CreateSectionData,
  UpdateSectionData,
  SectionOrder,
  User
} from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Auth
export const checkAuth = () => api.get<{authenticated: boolean, user_id: number}>('/auth/check');
export const logout = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get<User>('/me');

// Dashboard
export const getDashboard = () => api.get<DashboardData>('/links/dashboard');

// Links
export const getLinks = () => api.get<Link[]>('/links/');
export const createLink = (data: CreateLinkData) => api.post<Link>('/links/', data);
export const updateLink = (id: number, data: UpdateLinkData) => api.put<Link>(`/links/${id}`, data);
export const deleteLink = (id: number) => api.delete(`/links/${id}`);

// Sections
export const getSections = () => api.get<Section[]>('/sections/');
export const createSection = (data: CreateSectionData) => api.post<Section>('/sections/', data);
export const updateSection = (id: number, data: UpdateSectionData) => api.put<Section>(`/sections/${id}`, data);
export const deleteSection = (id: number) => api.delete(`/sections/${id}`);
export const reorderSections = (section_orders: SectionOrder[]) => 
  api.post('/sections/reorder', { section_orders });

export default api;