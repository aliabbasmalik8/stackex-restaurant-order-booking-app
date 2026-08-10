export interface IAuthenticationToken {
  email: string;
  userId: string;
  is_super_admin: boolean;
}

/** Request-scoped auth context (from verified JWT). */
export interface IAuthUser {
  token: string;
  email: string;
  userId: string;
  is_super_admin: boolean;
}
