const flights = new Map<string, Promise<string | null>>();
export function coordinateRefresh(
  realmKey: string,
  refresh: () => Promise<string | null>,
) {
  const current = flights.get(realmKey);
  if (current) return current;
  const next = refresh();
  flights.set(realmKey, next);
  next.finally(() => flights.delete(realmKey));
  return next;
}
