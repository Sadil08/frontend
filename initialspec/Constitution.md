# EduApp Frontend Constitution

## Clean Architecture Principles

EduApp frontend follows clean architecture for maintainability and scalability:
- **Separation of Concerns**: Pages handle routing and layout; components manage UI rendering; services handle API logic; utils provide shared functions. No business logic in components.
- **Dependency Inversion**: High-level modules (pages) depend on abstractions (services/interfaces), not low-level (API calls).
- **Single Responsibility Principle (SOLID)**: Each component has one job (e.g., BundleCard displays bundle info only); services handle one domain (e.g., authService for authentication).
- **Open-Closed Principle**: Components extensible via props without modification; services addable without changing existing code.
- **Liskov Substitution**: Interfaces allow interchangeable implementations (e.g., different API clients).
- **Interface Segregation**: Small, specific interfaces (e.g., separate auth and bundle services).
- **Dependency Injection**: Services injected via React context or hooks, enabling testing.

## Technology Stack

- **Next.js 14.2.4**: App Router for file-based routing; SSR for public pages, CSR for auth; TypeScript for type safety.
- **TypeScript**: Strict mode; interfaces for DTOs (e.g., PaperBundleDto); generics for reusable components.
- **Ant Design 5.22.4**: UI library for consistent components (Button, Card, Form, Table, Modal); customized with Tailwind for theming.
- **Tailwind CSS 3.4.1**: Utility-first for responsive layouts; integrated with Ant via tailwindcss-antd plugin.
- **React Hooks**: useState for local state, useEffect for side effects, useContext for global state (AuthContext); custom hooks for API calls (e.g., useBundles).
- **Axios 1.7.9**: HTTP client with interceptors for JWT and error handling; baseURL from env.

## Coding Styles

- **Naming Conventions**: PascalCase for components (BundleCard), camelCase for props/functions (onClick), kebab-case for CSS classes (bg-blue-50), UPPER_SNAKE for constants (API_BASE_URL).
- **Tailwind Classes**: Consistent patterns: bg-blue-50 for sections, shadow-md rounded-lg for cards, bg-blue-500 hover:bg-blue-600 for primary buttons, text-green-700 for titles, p-4 for padding, grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for responsive grids.
- **Ant Usage**: Wrap in Tailwind divs (e.g., <div className="bg-white shadow-md"><Card>...</Card></div>); use Ant for forms/tables/modals, customize via props (e.g., Button type="primary" className="bg-blue-500").
- **File Structure**: src/app/ for pages, src/components/ for UI, src/services/ for API, src/utils/ for helpers, src/context/ for global state.
- **Config Files**: next.config.js (CommonJS), .eslintrc.js (ESLint 8 legacy config).
- **Imports**: Absolute paths (e.g., import { BundleCard } from '@/components'); group: React, third-party, local.
- **Error Handling**: Try-catch in services; Ant message for user feedback; loading states with Spin.
- **Accessibility**: Ant provides a11y; add aria-labels; keyboard nav; screen reader support.
- **Testing**: Unit for components/services with Jest; integration for pages with React Testing Library.
- **Performance**: Lazy loading for routes; memo for components; optimize re-renders.

This constitution enforces version/style consistency for spec-driven development.