import type { UserRole } from './roles';

/** What the user may do on one event (not the global profile role alone). */
export type EventAccess = 'admin' | 'office' | 'teamleader' | 'photographer' | 'none';

export interface UserEventMembership {
  teamleaderEventIds: string[];
  officeEventIds: string[];
  photographerEventIds: string[];
}

export function canAccessTeamleaderApp(
  globalRole: UserRole | null | undefined,
  membership: UserEventMembership,
): boolean {
  if (!globalRole) return false;
  if (globalRole === 'admin' || globalRole === 'office' || globalRole === 'teamleader') {
    return true;
  }
  return membership.teamleaderEventIds.length > 0;
}

export function canAccessPhotographerApp(
  globalRole: UserRole | null | undefined,
  membership: UserEventMembership,
): boolean {
  if (!globalRole) return false;
  if (globalRole === 'admin') return true;
  if (globalRole === 'photographer') return true;
  return (
    membership.photographerEventIds.length > 0 ||
    membership.teamleaderEventIds.length > 0
  );
}

export function eventAccessFor(
  eventId: string,
  globalRole: UserRole,
  membership: UserEventMembership,
): EventAccess {
  if (globalRole === 'admin') return 'admin';
  if (membership.teamleaderEventIds.includes(eventId)) return 'teamleader';
  if (membership.officeEventIds.includes(eventId)) return 'office';
  if (membership.photographerEventIds.includes(eventId)) return 'photographer';
  return 'none';
}

export function canEditEventPlanning(access: EventAccess): boolean {
  return access === 'admin' || access === 'teamleader';
}

export function canViewEventWorkspace(access: EventAccess): boolean {
  return access === 'admin' || access === 'teamleader' || access === 'office';
}
