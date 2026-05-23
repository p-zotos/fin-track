# FinTrack — QA Portfolio · Web App

> A Finance Dashboard demo application built specifically to showcase comprehensive QA engineering practices.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Tests](https://img.shields.io/badge/E2E-Playwright-blue)s

---

## What this is

**FinTrack** is a realistic finance dashboard (React + Vite, deployed on GitHub Pages) that serves as the QA target for this portfolio. It is deliberately designed to be tested — with rich features, edge cases, empty states, error states, and a built-in QA test controls panel.

---

## Features

| Feature | Description |
|---|---|
| Authentication | Login / logout with session persistence |
| Dashboard | Balance overview, income/expense charts, spending breakdown, recent transactions |
| Transactions | Full CRUD — add, edit, delete, search, filter by category & type |
| Budgets | Set monthly limits per category, progress tracking, over-budget alerts |
| Feature flags | Runtime toggles for budget alerts |
| QA controls | Built-in test panel to reset seed data and toggle flags — no backend needed |
| Empty states | Triggered when all data is deleted |
| Error states | Forced via QA controls panel |

---

## Test coverage areas

This app is designed to exercise the following QA scenarios:

**Functional**
- Login with valid / invalid credentials
- Form validation (empty fields, negative amounts, invalid dates)
- CRUD operations and persistence across page reloads
- Search and filter combinations
- Budget threshold alerts (>80%, >100%)
- Navigation and protected routes

**Non-functional**
- Accessibility (axe-core, WCAG 2.1 AA)
- Performance (load time, chart render time)
- Responsive layout
- Feature flag toggling

---

## Running locally

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173/fin-track`

**Demo credentials:** `alex@fintrack.demo` / `demo1234`

---

## Project structure

```
src/
├── components/
│   ├── layout/       # Sidebar
│   └── shared/       # TestControls panel
├── data/
│   ├── seed.ts       # All demo data (single source of truth)
│   └── store.ts      # localStorage-based state + computed helpers
├── hooks/
│   └── useAuth.tsx   # Auth context
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── TransactionsPage.tsx
│   └── BudgetsPage.tsx
├── styles/
│   └── global.css
├── App.tsx
└── main.tsx
```

---

## data-testid reference

Every interactive element and meaningful output has a `data-testid` attribute, making selectors stable and independent of styling changes.

| Element | data-testid |
|---|---|
| Login form | `login-form` |
| Email input | `input-email` |
| Password input | `input-password` |
| Login button | `btn-login` |
| Login error | `login-error` |
| Dashboard page | `dashboard-page` |
| Stat cards | `stat-balance`, `stat-income`, `stat-expenses`, `stat-net` |
| Budget alert | `budget-alert-banner` |
| Transactions page | `transactions-page` |
| Search input | `search-input` |
| Category filter | `filter-category` |
| Type filter | `filter-type` |
| Add transaction | `btn-add-transaction` |
| Transaction row | `txn-row-{id}` |
| Empty state | `empty-state` |
| Transaction modal | `transaction-modal` |
| Budgets page | `budgets-page` |
| Budget card | `budget-card-{id}` |
| Budget progress | `budget-progress-{id}` |
| QA toggle | `btn-test-controls-toggle` |
| QA panel | `test-controls-panel` |
| Feature flag | `flag-{flagName}` |
| Reset data | `btn-reset-data` |

---

## QA Test Controls panel

Click the **QA CONTROLS** button (bottom-right corner) to open the panel. From there you can:

- Toggle feature flags at runtime (budget alerts, AI insights, export button)
- Reset all data to the original seed state (reloads the page)

This replaces the need for a real backend or database in automated tests.

---