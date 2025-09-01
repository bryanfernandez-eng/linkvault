export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Section {
  id: number;
  name: string;
  order: number;
  user_id: number;
  created_at: string;
}

export interface Link {
  id: number;
  title: string;
  url: string;
  description?: string;
  is_pinned: boolean;
  user_id: number;
  section_id?: number;
  created_at: string;
}

export interface SectionWithLinks extends Section {
  links: Link[];
}

export interface DashboardData {
  pinned_links: Link[];
  sections: SectionWithLinks[];
}

export interface CreateLinkData {
  title: string;
  url: string;
  description?: string;
  is_pinned?: boolean;
  section_id?: number;
}

export interface UpdateLinkData {
  title?: string;
  url?: string;
  description?: string;
  is_pinned?: boolean;
  section_id?: number;
}

export interface CreateSectionData {
  name: string;
}

export interface UpdateSectionData {
  name?: string;
  order?: number;
}

export interface SectionOrder {
  id: number;
  order: number;
}