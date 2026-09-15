import type { Realm } from './client';
export const realmStorage = {
  accessTokenKey: (realm: Realm) => `nexus.${realm}.access_token`,
  refreshTokenKey: (realm: Realm) => `nexus.${realm}.refresh_token`,
  getAccessToken: (realm: Realm) =>
    typeof window === 'undefined'
      ? null
      : localStorage.getItem(`nexus.${realm}.access_token`),
  setAccessToken: (realm: Realm, value: string | null) => {
    if (typeof window === 'undefined') return;
    const key = `nexus.${realm}.access_token`;
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  },
};
