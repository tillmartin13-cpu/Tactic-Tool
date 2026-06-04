/** App-facing roles stored in profiles.role (Supabase). */
export type UserRole = 'admin' | 'teamleader' | 'office' | 'photographer';

/** UI labels: Admin, Office, Team Leader, Photographer */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  office: 'Office',
  teamleader: 'Team Leader',
  photographer: 'Photographer',
};

export const USER_ROLES: readonly UserRole[] = [
  'admin',
  'teamleader',
  'office',
  'photographer',
] as const;

export function roleLabel(role: UserRole | string): string {
  if (isUserRole(role)) return ROLE_LABELS[role];
  return role;
}

/** Roles that sign in to the Teamleader web app (planning / support). */
export const TEAMLEADER_APP_ROLES: readonly UserRole[] = [
  'admin',
  'teamleader',
  'office',
] as const;

export const PHOTOGRAPHER_APP_ROLES: readonly UserRole[] = ['photographer'] as const;

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export function usesTeamleaderApp(role: UserRole): boolean {
  return (TEAMLEADER_APP_ROLES as readonly string[]).includes(role);
}

export function usesPhotographerApp(role: UserRole): boolean {
  return role === 'photographer';
}

/** Office: internal Sportograf staff — support TLs on assigned events (read-first). */
export function isOffice(role: UserRole): boolean {
  return role === 'office';
}

export function isTeamleaderOrAbove(role: UserRole): boolean {
  return role === 'admin' || role === 'teamleader';
}

export function canManageEvents(role: UserRole): boolean {
  return role === 'admin' || role === 'teamleader';
}

export function canEditSpots(role: UserRole): boolean {
  return role === 'admin' || role === 'teamleader';
}

export function canViewEventPlanning(role: UserRole): boolean {
  return usesTeamleaderApp(role);
}

/** Send „Team informieren“ email (not automatic DB triggers). */
export function canSendTeamBroadcast(role: UserRole): boolean {
  return role === 'admin' || role === 'teamleader' || role === 'office';
}

/** Create cars and assign photographer Kürzel (carpool board). */
export function canEditCarpools(role: UserRole): boolean {
  return role === 'admin' || role === 'teamleader';
}

export function canViewCarpools(role: UserRole): boolean {
  return canViewEventPlanning(role);
}
