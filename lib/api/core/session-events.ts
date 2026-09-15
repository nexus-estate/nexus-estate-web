import type { Realm } from './client';

const eventName = 'nexus:realm-session-expired';
const notified = new Set<Realm>();

export function dispatchRealmSessionExpired(realm: Realm) {
  if (typeof window === 'undefined' || notified.has(realm)) return;
  notified.add(realm);
  window.dispatchEvent(new CustomEvent(eventName, { detail: { realm } }));
}

export function markRealmSessionActive(realm: Realm) {
  notified.delete(realm);
}

export function subscribeRealmSessionExpired(
  realm: Realm,
  callback: () => void,
) {
  if (typeof window === 'undefined') return () => undefined;
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<{ realm?: Realm }>).detail;
    if (detail?.realm === realm) callback();
  };
  window.addEventListener(eventName, listener);
  return () => window.removeEventListener(eventName, listener);
}
