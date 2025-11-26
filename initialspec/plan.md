# EduApp Frontend Implementation Plan: How

## Phased Implementation

### Phase 1: Project Setup and Authentication
- Setup Next.js 14.2.4 with TypeScript, install Ant Design 5.22.4, Tailwind CSS 3.4.1, Axios 1.7.9.
- Fix config files: rename next.config.ts to next.config.js (convert to CommonJS), create .eslintrc.js for ESLint 8, remove eslint.config.mjs.
- Configure tailwindcss-antd plugin for integration.
- Create AuthContext with JWT handling.
- Implement Login/Register pages with AuthForm component.
- Setup apiClient with interceptors.
- Create authService for login/register.
- Add protected route HOC for role checks.

### Phase 2: Public and Student Core Pages
- Implement Home page with BundleCard grid, filters, search.
- Create BundleDetail page with conditional access.
- Build Dashboard with BundleCard, ProgressChart, LeaderboardTable.
- Add BundlePapers page with PaperCard.
- Implement Progress and Leaderboard pages.
- Create Cart page with CartItem, placeholder checkout.
- Develop bundleService, paperService, progressService, etc.

### Phase 3: Attempt and Results
- Build PaperAttempt page with Timer, QuestionComponent, nav buttons.
- Implement PaperResults page with feedback display.
- Add attemptService for start/submit.
- Integrate AI analyses fetch.
- Handle timer logic with useEffect.

### Phase 4: Admin Management
- Create AdminDashboard with overview cards.
- Implement CRUD pages: SubjectManagement, LessonManagement, BundleManagement, PaperManagement, QuestionManagement with ListTable and AdminForm.
- Add UserList and UserDetail pages.
- Develop adminService, subjectService, etc.
- Stepwise forms for bundle/question creation.

### Phase 5: Enhancements and Polish
- Add suggested components: ProgressBar, NotificationModal, SearchBar.
- Implement notifications, advanced filtering.
- Add loading states, error handling.
- Responsive testing, accessibility checks.
- Unit/integration tests.

## Coding Snippets

### Component Example with Tailwind/Ant
```tsx
// src/components/BundleCard.tsx
import { Card, Button, Badge } from 'antd';
import { PaperBundleDto } from '@/types';

interface BundleCardProps {
  bundle: PaperBundleDto;
  hasAccess: boolean;
}

export const BundleCard: React.FC<BundleCardProps> = ({ bundle, hasAccess }) => (
  <div className="bg-white shadow-md rounded-lg p-4">
    <Card className="border-none">
      <h3 className="text-xl font-semibold text-green-700">{bundle.name}</h3>
      <p className="text-gray-600">{bundle.description}</p>
      <p className="text-lg font-bold">${bundle.price}</p>
      <Badge color="blue">{bundle.type}</Badge>
      <Badge color="green">{bundle.examType}</Badge>
      <Button
        type="primary"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4"
        onClick={() => {/* navigate */}}
      >
        {hasAccess ? 'View Papers' : 'Purchase'}
      </Button>
    </Card>
  </div>
);
```

### API Call with Axios
```tsx
// src/services/bundleService.ts
import { apiClient } from '@/utils/apiClient';
import { PaperBundleDto } from '@/types';

export const getBundles = async (filters?: any): Promise<PaperBundleDto[]> => {
  const response = await apiClient.get('/api/paper-bundles', { params: filters });
  return response.data;
};

export const getBundle = async (id: number): Promise<PaperBundleDto> => {
  const response = await apiClient.get(`/api/paper-bundles/${id}`);
  return response.data;
};
```

### Hook Example
```tsx
// src/hooks/useBundles.ts
import { useState, useEffect } from 'react';
import { getBundles } from '@/services/bundleService';
import { PaperBundleDto } from '@/types';

export const useBundles = (filters?: any) => {
  const [bundles, setBundles] = useState<PaperBundleDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const data = await getBundles(filters);
        setBundles(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, [filters]);

  return { bundles, loading };
};
```

These snippets ensure consistency with versions/styles: Next.js App Router, TypeScript interfaces, Ant components wrapped in Tailwind, Axios with interceptors.