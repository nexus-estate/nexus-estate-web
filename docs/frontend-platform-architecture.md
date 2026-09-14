# Frontend platform architecture

Nexus Estate remains one Next.js application and repository with three product
shells: Marketplace/Customer, Provider/Supply, and Administration/ERP.

There are only two authentication realms. Marketplace and Provider use the
Customer token; Provider adds a selected `X-Provider-Id` context and resolves
authorization for a `ProviderMembership`. Administration uses an independent
Administrator token. A Provider is never a third login realm.

The shared API transport owns timeout, error parsing, locale (`x-lang`), and
realm refresh coordination. Customer, Provider, and Administration API modules
own their DTOs and React Query namespaces. Frontend permission checks only shape
UX; the backend remains authoritative.

Provider context discovery for multiple memberships is not available in the
current backend. A future Customer-facing `GET /providers/me/contexts` (or
equivalent) is required before offering a context switcher. Administration
membership APIs are not used by Provider UI.

Customer navigation stays consumer-facing. Provider owns supply operations.
Administration navigation is permission-based and manages authorization across
Marketplace, ProviderMembership, and Administration subject types.
