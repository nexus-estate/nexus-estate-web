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

## UI architecture

`components/ui` owns generic primitives and accessible interaction patterns
(controls, panels, tables, loading and status states). `components/portal` owns
the shared responsive application shell; Provider and Administration supply
their own translated navigation and identity context. Marketplace uses the
same tokens and primitives but keeps a consumer-oriented composition with
property imagery and more whitespace.

Pages follow `PageHeader → actions/context → content surface → loading, empty,
error, or success state`. New navigation items should be added to the owning
layout configuration and have a localized label in both catalogues. Raw route
segments, permission codes, IDs, and user-created names are never presented as
translated UI copy.
