# Nexus Estate Web — Documentation

> This directory is the **single source of truth** for all project documentation.

## 📚 Documents

| Document                                | Description                                      |
| --------------------------------------- | ------------------------------------------------ |
| [Developer Rules](./developer.rules.md) | Architecture, conventions, and development rules |

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Next.js App                     │
│  ┌───────────┐  ┌───────────┐  ┌─────────────┐ │
│  │ App Router │  │Components │  │   Lib/       │ │
│  │ (pages)   │  │ (UI)      │  │  Utilities   │ │
│  └─────┬─────┘  └─────┬─────┘  └──────┬──────┘ │
│        │              │               │         │
│        └──────────────┼───────────────┘         │
│                       │                          │
│              ┌────────▼────────┐                │
│              │   API Client    │                │
│              │  (lib/api/)     │                │
│              └────────┬────────┘                │
│                       │                          │
└───────────────────────┼──────────────────────────┘
                        │ HTTP/REST
                        ▼
              ┌──────────────────┐
              │   API Gateway    │
              │  (NestJS :3001)  │
              └──────────────────┘
```

## 🚀 Quick Reference

```bash
# Development
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run type-check    # TypeScript type check
npm run format        # Prettier format
npm run format:check  # Prettier check

# Testing
npm test              # Unit tests
npm run test:watch    # Unit tests (watch)
npm run test:coverage # Unit tests with coverage
npm run test:e2e      # Playwright E2E tests
npm run test:e2e:ui   # Playwright E2E (UI mode)
```
