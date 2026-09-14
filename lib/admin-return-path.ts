/** Returns an internal Administration path or the safe portal default. */
export function safeAdministrationNext(rawNext: string | null): string {
  return rawNext && rawNext.startsWith('/admin') && !rawNext.startsWith('//')
    ? rawNext
    : '/admin';
}
