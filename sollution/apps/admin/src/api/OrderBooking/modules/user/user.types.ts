export type UserProfile = {
  id: string;
  name?: string;
  email?: string;
  contactPhone: string | null;
  is_super_admin: boolean;
  is_active: boolean;
  created_at: string;
};
