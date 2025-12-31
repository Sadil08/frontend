# React & Next.js Complete Learning Guide
## Using the EduApp Frontend Codebase

> **Purpose**: This document teaches you React and Next.js from basic to advanced concepts using real code from this application. After reading this, you'll understand both the framework fundamentals AND how this specific application works.

---

## Table of Contents
1. [Project Structure & Architecture](#project-structure--architecture)
2. [Core React Concepts](#core-react-concepts)
3. [Next.js Fundamentals](#nextjs-fundamentals)
4. [State Management & Context](#state-management--context)
5. [Custom Hooks](#custom-hooks)
6. [Services & API Integration](#services--api-integration)
7. [TypeScript Types](#typescript-types)
8. [Utilities](#utilities)
9. [Component Deep Dive](#component-deep-dive)
10. [Advanced Patterns](#advanced-patterns)

---

## 1. Project Structure & Architecture

### Directory Layout
```
frontend/src/
├── app/              # Next.js 13+ App Router pages
├── components/       # Reusable React components
├── context/          # React Context for global state
├── hooks/            # Custom React hooks
├── services/         # API communication layer
├── types/            # TypeScript type definitions
└── utils/            # Helper functions
```

### Why This Structure?

**Separation of Concerns**: Each directory has a single responsibility:
- `app/` = Routing & page-level components
- `components/` = Reusable UI pieces
- `context/` = Global state (auth, theme, etc.)
- `hooks/` = Reusable stateful logic
- `services/` = External data fetching
- `types/` = Type safety contracts
- `utils/` = Pure helper functions

---

## 2. Core React Concepts

### 2.1 What is React?

React is a **JavaScript library** for building user interfaces. It's based on **components** - reusable pieces of UI that manage their own state and logic.

### 2.2 Components

**Example: `PublicBundleCard.tsx`**

```tsx
export const PublicBundleCard: React.FC<PublicBundleCardProps> = ({ bundle }) => {
  // This is a functional component
  // React.FC = "React Functional Component"
  // PublicBundleCardProps = TypeScript interface defining props
  
  return (
    <div className="...">
      {/* JSX - looks like HTML but it's JavaScript */}
      <h3>{bundle.name}</h3>
    </div>
  );
};
```

**Key Concepts**:
- **Props**: Data passed from parent to child (like function parameters)
- **JSX**: Syntax extension that looks like HTML
- **React.FC**: TypeScript type for functional components

### 2.3 State - The Heart of React

**Example: `BundleFilters.tsx`**

```tsx
const [subjects, setSubjects] = useState<SubjectDto[]>([]);
//     ↑ current value    ↑ function to update    ↑ initial value
```

**Line-by-Line Breakdown**:

1. `useState` is a **React Hook** (special function that adds features to components)
2. `<SubjectDto[]>` is a **TypeScript generic** (tells TypeScript what type of data)
3. `[]` is the **initial value** (empty array)
4. `subjects` is the **current state value**
5. `setSubjects` is the **updater function** (ONLY way to change state)

**Why State Matters**:
```tsx
// ❌ WRONG - Direct mutation doesn't trigger re-render
subjects.push(newSubject);

// ✅ CORRECT - Using setter triggers re-render
setSubjects([...subjects, newSubject]);
```

### 2.4 Effects - Side Effects & Lifecycle

**Example: `BundleFilters.tsx`**

```tsx
useEffect(() => {
  // This code runs AFTER the component renders
  const fetchData = async () => {
    const [subjectsData, lessonsData] = await Promise.all([
      getSubjects(),
      getLessons()
    ]);
    setSubjects(subjectsData);
    setAllLessons(lessonsData);
  };
  fetchData();
}, []); // ← Dependency array
```

**Line-by-Line Breakdown**:

1. `useEffect(() => { ... }, [])` - Hook for side effects
2. **First argument**: Function to run
3. **Second argument**: Dependency array
   - `[]` = Run ONCE on mount
   - `[subjectId]` = Run when `subjectId` changes
   - No array = Run on EVERY render (usually a bug!)

**Common Use Cases**:
- Fetching data from API
- Setting up subscriptions
- Manually changing the DOM
- Setting up timers

### 2.5 Event Handling

**Example: `BundleFilters.tsx`**

```tsx
<Select
  onChange={(value) => {
    console.log('Subject changed to:', value);
    onFilterChange({ ...filters, subjectId: value, lessonId: undefined });
  }}
>
```

**Key Points**:
- Event handlers are **functions** passed as props
- Use **arrow functions** to avoid `this` binding issues
- Can pass data to parent components via callbacks

---

## 3. Next.js Fundamentals

### 3.1 What is Next.js?

Next.js is a **React framework** that adds:
- **File-based routing** (no need for react-router)
- **Server-side rendering** (SSR)
- **API routes** (backend in the same project)
- **Automatic code splitting** (faster page loads)

### 3.2 App Router (Next.js 13+)

**Example: `app/bundles/page.tsx`**

```tsx
// File: app/bundles/page.tsx
// URL: http://localhost:3000/bundles

export default function BundlesPage() {
  return <div>Bundles Page</div>;
}
```

**Routing Rules**:
- `app/page.tsx` → `/`
- `app/bundles/page.tsx` → `/bundles`
- `app/admin/subjects/page.tsx` → `/admin/subjects`
- `app/papers/[id]/page.tsx` → `/papers/123` (dynamic route)

### 3.3 Client vs Server Components

**Example: `app/bundles/page.tsx`**

```tsx
"use client"; // ← This makes it a Client Component

import { useState } from 'react';

export default function BundlesPage() {
  // Can use hooks, browser APIs, event handlers
  const [count, setCount] = useState(0);
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Client Components** (`"use client"`):
- ✅ Can use hooks (`useState`, `useEffect`)
- ✅ Can handle events (`onClick`, `onChange`)
- ✅ Can access browser APIs (`localStorage`, `window`)
- ❌ Run in the browser (larger bundle size)

**Server Components** (default):
- ✅ Can fetch data directly
- ✅ Smaller bundle size
- ✅ Better SEO
- ❌ Cannot use hooks or event handlers

### 3.4 Navigation

**Example: `app/bundles/page.tsx`**

```tsx
import { useRouter, useSearchParams } from 'next/navigation';

const router = useRouter();
const searchParams = useSearchParams();

// Navigate programmatically
router.push('/admin/subjects');

// Get URL parameters
const subjectId = searchParams.get('subjectId'); // ?subjectId=10

// Update URL without full page reload
router.replace(`/bundles?${queryString}`, { scroll: false });
```

**Key Hooks**:
- `useRouter()` - Navigate programmatically
- `useSearchParams()` - Read URL query parameters
- `usePathname()` - Get current path

---

## 4. State Management & Context

### 4.1 Why Context?

**Problem**: Passing props through many levels ("prop drilling")

```tsx
<App user={user}>
  <Dashboard user={user}>
    <Sidebar user={user}>
      <UserProfile user={user} /> {/* Finally used here! */}
    </Sidebar>
  </Dashboard>
</App>
```

**Solution**: Context API

### 4.2 Creating Context

**Example: `context/AuthContext.tsx`**

```tsx
// Step 1: Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Step 2: Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Decode JWT to get user info
      const decoded = jwtDecode<JWTPayload>(savedToken);
      setUser({
        id: decoded.id,
        email: decoded.sub,
        role: decoded.role
      });
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decoded = jwtDecode<JWTPayload>(newToken);
    setUser({
      id: decoded.id,
      email: decoded.sub,
      role: decoded.role
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Step 3: Create a custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**Line-by-Line Breakdown**:

1. **`createContext`**: Creates a new context object
2. **`AuthProvider`**: Wrapper component that provides the context value
3. **`children`**: All child components (React's special prop)
4. **`useEffect(..., [])`**: Runs once on mount to load saved token
5. **`localStorage`**: Browser API to persist data
6. **`jwtDecode`**: Decodes JWT token to extract user info
7. **`<AuthContext.Provider value={...}>`**: Makes value available to children
8. **`useAuth`**: Custom hook to access context (cleaner than `useContext`)

### 4.3 Using Context

**Example: `app/bundles/page.tsx`**

```tsx
import { useAuth } from '@/context/AuthContext';

export default function BundlesPage() {
  const { user } = useAuth(); // ← Access context value
  
  return (
    <div>
      {!user && <a href="/register">Get Started Free</a>}
      {user && <p>Welcome, {user.email}!</p>}
    </div>
  );
}
```

---

## 5. Custom Hooks

### 5.1 What are Custom Hooks?

Custom hooks are **reusable functions** that use React hooks internally. They let you extract component logic into reusable functions.

**Naming Rule**: Must start with `use` (e.g., `useBundles`, `useAuth`)

### 5.2 Example: `useBundles` Hook

**File: `hooks/useBundles.ts`**

```tsx
export const useBundles = (filters?: BundleFilterParams) => {
  const [bundles, setBundles] = useState<PaperBundleSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const filtersRef = useRef<string>('');

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      try {
        const filtersString = JSON.stringify(filters || {});
        const now = Date.now();

        // Check cache
        if (
          bundleCache &&
          bundleCache.filters === filtersString &&
          now - bundleCache.timestamp < CACHE_DURATION
        ) {
          setBundles(bundleCache.data);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        const data = await getBundles(filters);
        setBundles(data);

        // Update cache
        bundleCache = {
          data,
          timestamp: now,
          filters: filtersString
        };
      } catch (error) {
        console.error('Failed to fetch bundles:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if filters changed
    const filtersString = JSON.stringify(filters || {});
    if (filtersRef.current !== filtersString) {
      filtersRef.current = filtersString;
      fetchBundles();
    }
  }, [filters]);

  return { bundles, loading };
};
```

**Line-by-Line Breakdown**:

1. **`useState`**: Manages bundles data and loading state
2. **`useRef`**: Stores previous filter value (doesn't trigger re-render)
3. **`useEffect`**: Runs when `filters` changes
4. **`JSON.stringify`**: Converts object to string for comparison
5. **Caching**: Stores fetched data to avoid unnecessary API calls
6. **`filtersRef.current`**: Compare with previous filters
7. **`return { bundles, loading }`**: Returns data to component

**Usage**:

```tsx
const { bundles, loading } = useBundles(filters);

if (loading) return <div>Loading...</div>;
return <div>{bundles.map(b => <BundleCard key={b.id} bundle={b} />)}</div>;
```

**Benefits**:
- ✅ Reusable across components
- ✅ Encapsulates complex logic
- ✅ Easier to test
- ✅ Cleaner component code

---

## 6. Services & API Integration

### 6.1 API Client Setup

**File: `utils/apiClient.ts`**

```tsx
import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - runs BEFORE every request
apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token to Authorization header
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - runs AFTER every response
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Line-by-Line Breakdown**:

1. **`axios.create`**: Creates a configured axios instance
2. **`baseURL`**: All requests will be prefixed with this URL
3. **`process.env.NEXT_PUBLIC_API_URL`**: Environment variable (from `.env.local`)
4. **`interceptors.request`**: Middleware that runs before requests
5. **`localStorage.getItem('token')`**: Retrieve JWT from browser storage
6. **`config.headers.Authorization`**: Add token to request header
7. **`interceptors.response`**: Middleware that runs after responses
8. **`error.response?.status === 401`**: Check for unauthorized error
9. **`window.location.href`**: Redirect to login page

### 6.2 Service Layer

**File: `services/bundleService.ts`**

```tsx
import apiClient from '@/utils/apiClient';
import { PaperBundleSummaryDto } from '@/types';

export interface BundleFilterParams {
  type?: 'MCQ' | 'ESSAY' | 'MIXED';
  examType?: string;
  subjectId?: number;
  lessonId?: number;
  isPastPaper?: boolean;
  minPrice?: number;
  maxPrice?: number;
  name?: string;
}

export const bundleService = {
  /**
   * Filter bundles by multiple criteria
   */
  filterBundles: async (filters?: BundleFilterParams): Promise<PaperBundleSummaryDto[]> => {
    const response = await apiClient.get<PaperBundleSummaryDto[]>(
      '/api/paper-bundles/filter',
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get detailed information for a specific bundle
   */
  getBundle: async (id: number): Promise<PaperBundleDetailDto> => {
    const response = await apiClient.get<PaperBundleDetailDto>(`/api/paper-bundles/${id}`);
    return response.data;
  },

  /**
   * Purchase a bundle
   */
  purchaseBundle: async (id: number): Promise<void> => {
    await apiClient.post(`/api/paper-bundles/${id}/purchase`);
  },
};
```

**Line-by-Line Breakdown**:

1. **`export interface`**: TypeScript interface for type safety
2. **`type?: 'MCQ' | 'ESSAY' | 'MIXED'`**: Optional field with specific allowed values
3. **`async`**: Function returns a Promise
4. **`Promise<PaperBundleSummaryDto[]>`**: TypeScript return type
5. **`apiClient.get<T>`**: Generic type for response data
6. **`{ params: filters }`**: Axios converts to query string (?type=MCQ&subjectId=10)
7. **`response.data`**: Axios wraps response in `{ data, status, headers }`
8. **Template literals**: `` `/api/bundles/${id}` `` → `/api/bundles/123`

**Why Service Layer?**:
- ✅ Centralized API logic
- ✅ Easy to mock for testing
- ✅ Type-safe API calls
- ✅ Reusable across components

---

## 7. TypeScript Types

### 7.1 Why TypeScript?

TypeScript adds **type safety** to JavaScript:

```tsx
// ❌ JavaScript - No error until runtime
const bundle = { name: "Math Bundle" };
console.log(bundle.price.toFixed(2)); // Runtime error: Cannot read property 'toFixed' of undefined

// ✅ TypeScript - Error at compile time
interface Bundle {
  name: string;
  price: number;
}
const bundle: Bundle = { name: "Math Bundle" }; // Error: Property 'price' is missing
```

### 7.2 Type Definitions

**File: `types/index.ts`**

```tsx
// Basic interface
export interface SubjectDto {
  id: number;
  name: string;
  description: string;
  lessons?: LessonDto[]; // Optional field
}

// Interface with nested types
export interface PaperBundleSummaryDto {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'MCQ' | 'ESSAY' | 'MIXED'; // Union type (only these 3 values allowed)
  examType: string;
  subjectId: number;
  subjectName: string;
  lessonId?: number; // Optional
  lessonName?: string;
  isPastPaper: boolean;
  paperCount: number;
  totalMarks: number;
  imageUrl?: string;
}

// Type alias (alternative to interface)
export type User = {
  id: number;
  email: string;
  role: 'STUDENT' | 'ADMIN';
};

// Extending interfaces
export interface AdminBundleDto extends PaperBundleSummaryDto {
  createdAt: string;
  createdBy: string;
  studentCount: number;
  totalRevenue: number;
}
```

**Key Concepts**:

1. **`interface`**: Defines the shape of an object
2. **`?`**: Optional property
3. **Union types**: `'MCQ' | 'ESSAY' | 'MIXED'` (only these values)
4. **`extends`**: Inherit properties from another interface
5. **`type`**: Alternative to interface (can do more complex types)

### 7.3 Generics

```tsx
// Generic function
function getFirstItem<T>(array: T[]): T | undefined {
  return array[0];
}

const firstNumber = getFirstItem([1, 2, 3]); // Type: number | undefined
const firstString = getFirstItem(['a', 'b']); // Type: string | undefined

// Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <div>{items.map(renderItem)}</div>;
}

// Usage
<List<Bundle>
  items={bundles}
  renderItem={(bundle) => <BundleCard bundle={bundle} />}
/>
```

---

## 8. Utilities

### 8.1 Helper Functions

**File: `utils/apiClient.ts`** (already covered above)

**Common Patterns**:

```tsx
// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format date
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Debounce (delay function execution)
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
```

---

## 9. Component Deep Dive

### 9.1 BundleFilters Component

**File: `components/BundleFilters.tsx`**

```tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Select, Slider, Checkbox, Button, Badge, Drawer } from 'antd';
import { FilterOutlined, CloseOutlined } from '@ant-design/icons';
import { BundleFilterParams, getSubjects, getLessons } from '@/services/bundleService';
import { SubjectDto, LessonDto } from '@/types';

interface BundleFiltersProps {
  filters: BundleFilterParams;
  onFilterChange: (filters: BundleFilterParams) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
}

export const BundleFilters: React.FC<BundleFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isMobile = false,
}) => {
  // Local state for dropdown options
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [allLessons, setAllLessons] = useState<LessonDto[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<LessonDto[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Fetch subjects and lessons on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsData, lessonsData] = await Promise.all([
          getSubjects(),
          getLessons()
        ]);
        setSubjects(subjectsData);
        setAllLessons(lessonsData);
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };
    fetchData();
  }, []);

  // Filter lessons when subject changes
  useEffect(() => {
    if (filters.subjectId) {
      const filtered = allLessons.filter(l => l.subjectId === filters.subjectId);
      setFilteredLessons(filtered);
    } else {
      setFilteredLessons([]);
    }
  }, [filters.subjectId, allLessons]);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== null && value !== ''
  ).length;

  // Render filter UI
  const filterContent = (
    <div className="space-y-4">
      {/* Subject Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Subject
        </label>
        <Select
          placeholder="All Subjects"
          value={filters.subjectId || undefined}
          onChange={(value) => {
            // Update both subjectId and reset lessonId in one call
            onFilterChange({ ...filters, subjectId: value, lessonId: undefined });
          }}
          className="w-full"
          size="large"
          allowClear
        >
          {subjects.map(subject => (
            <Select.Option key={subject.id} value={subject.id}>
              {subject.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Lesson Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Lesson
        </label>
        <Select
          placeholder={filters.subjectId ? "All Lessons" : "Select a Subject first"}
          value={filters.lessonId || undefined}
          onChange={(value) => onFilterChange({ ...filters, lessonId: value })}
          className="w-full"
          size="large"
          allowClear
          disabled={!filters.subjectId}
        >
          {filteredLessons.map(lesson => (
            <Select.Option key={lesson.id} value={lesson.id}>
              {lesson.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Clear Filters Button */}
      {activeFilterCount > 0 && (
        <Button
          type="default"
          danger
          block
          size="large"
          icon={<CloseOutlined />}
          onClick={() => {
            onClearFilters();
            if (isMobile) setDrawerVisible(false);
          }}
          className="mt-4"
        >
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  // Mobile: Show drawer
  if (isMobile) {
    return (
      <>
        <Button
          type="primary"
          size="large"
          icon={<FilterOutlined />}
          onClick={() => setDrawerVisible(true)}
          className="w-full"
        >
          <Badge count={activeFilterCount} offset={[10, 0]}>
            Filters
          </Badge>
        </Button>
        <Drawer
          title="Filter Bundles"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={320}
        >
          {filterContent}
        </Drawer>
      </>
    );
  }

  // Desktop: Show inline
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FilterOutlined className="text-primary-600" />
          Filters
          {activeFilterCount > 0 && (
            <Badge count={activeFilterCount} className="ml-2" />
          )}
        </h3>
      </div>
      {filterContent}
    </div>
  );
};
```

**Key Patterns**:

1. **Controlled Components**: `value` and `onChange` props
2. **Conditional Rendering**: `{condition && <Component />}`
3. **Responsive Design**: Different UI for mobile vs desktop
4. **Spread Operator**: `{ ...filters, subjectId: value }` (immutable update)
5. **Array Methods**: `filter`, `map`
6. **Optional Chaining**: `filters.subjectId || undefined`

---

## 10. Advanced Patterns

### 10.1 Compound Components

```tsx
// Parent component manages state
<Tabs defaultActiveKey="1">
  <Tabs.TabPane tab="Tab 1" key="1">
    Content 1
  </Tabs.TabPane>
  <Tabs.TabPane tab="Tab 2" key="2">
    Content 2
  </Tabs.TabPane>
</Tabs>
```

### 10.2 Render Props

```tsx
<DataFetcher url="/api/bundles">
  {({ data, loading, error }) => {
    if (loading) return <Spinner />;
    if (error) return <Error message={error} />;
    return <BundleList bundles={data} />;
  }}
</DataFetcher>
```

### 10.3 Higher-Order Components (HOC)

```tsx
function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user } = useAuth();
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return <Component {...props} />;
  };
}

// Usage
const ProtectedPage = withAuth(DashboardPage);
```

### 10.4 Memoization

```tsx
import { useMemo, useCallback } from 'react';

// useMemo - Memoize computed values
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]); // Only recompute when a or b changes

// useCallback - Memoize functions
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // Only recreate function when a or b changes
```

### 10.5 Error Boundaries

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Summary

You've learned:

✅ **React Fundamentals**: Components, State, Effects, Events  
✅ **Next.js Features**: App Router, Client/Server Components, Navigation  
✅ **State Management**: Context API, Custom Hooks  
✅ **API Integration**: Axios, Interceptors, Service Layer  
✅ **TypeScript**: Interfaces, Generics, Type Safety  
✅ **Advanced Patterns**: Memoization, HOCs, Error Boundaries  

**Next Steps**:
1. Read through each component in `/components`
2. Trace data flow from API → Service → Hook → Component
3. Experiment by modifying filters or adding new features
4. Build a new feature from scratch using these patterns

**Resources**:
- [React Docs](https://react.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
