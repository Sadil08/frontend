# EduApp Frontend Tasks: Detailed Breakdown for SDD Coding

## Phase 1: Project Setup and Authentication

### Project Setup
1. Initialize Next.js 14.2.4 project with TypeScript: `npx create-next-app@14.2.4 --typescript`.
2. Install dependencies: `npm install antd@5.22.4 tailwindcss@3.4.1 axios@1.7.9 tailwindcss-antd`.
3. Configure Tailwind: Create tailwind.config.js with antd plugin.
4. Setup file structure: src/app/, src/components/, src/services/, src/utils/, src/context/, src/types/.
5. Create .env.local with API_BASE_URL.

### AuthContext
1. Create src/context/AuthContext.tsx.
2. Define User interface: { id: number; role: 'STUDENT' | 'ADMIN'; email: string }.
3. Implement AuthProvider with useState for user, useEffect to decode JWT from localStorage.
4. Add login function: store token, set user.
5. Add logout function: clear token, set user to null.
6. Export useAuth hook.

### apiClient
1. Create src/utils/apiClient.ts.
2. Initialize Axios instance with baseURL from env.
3. Add request interceptor for Authorization header with Bearer token.
4. Add response interceptor for 401: logout; show error messages with Ant message.

### authService
1. Create src/services/authService.ts.
2. Implement login: POST /api/auth/login, return JwtResponse.
3. Implement register: POST /api/auth/register, return UserResponse.
4. Handle errors with throw.

### AuthForm Component
1. Create src/components/AuthForm.tsx.
2. Use Ant Form with email/password inputs, name for register.
3. Props: isRegister: boolean.
4. On submit: call authService, on success set context, redirect.
5. Styling: Card bg-white shadow-lg p-8; inputs border-gray-300 focus:border-blue-500.

### Login Page
1. Create src/app/login/page.tsx.
2. Render AuthForm with isRegister=false.
3. Centered layout with max-w-md mx-auto p-4.

### Register Page
1. Create src/app/register/page.tsx.
2. Render AuthForm with isRegister=true.
3. Similar layout.

### Protected Route HOC
1. Create src/components/ProtectedRoute.tsx.
2. Check user role, redirect if not authorized.
3. Wrap pages with <ProtectedRoute role="STUDENT">.

## Phase 2: Public and Student Core Pages

### BundleCard Component
1. Create src/components/BundleCard.tsx.
2. Props: bundle: PaperBundleDto, hasAccess: boolean.
3. Render Card with title, desc, price, badges.
4. Button: "View" or "Purchase" with onClick navigate or add to cart.
5. Styling: bg-white shadow-md rounded-lg p-4; button bg-blue-500 hover:bg-blue-600.

### Home Page
1. Create src/app/page.tsx.
2. Use useBundles hook for data.
3. Render Header, filters (Ant Select), grid of BundleCard.
4. SearchBar: input with debounce.
5. Styling: Container max-w-7xl mx-auto p-4; grid gap-4.

### BundleDetail Page
1. Create src/app/bundles/[id]/page.tsx.
2. Fetch bundle and access with useBundle, useAccess.
3. Render bundle Card, conditional PaperCard grid or purchase button.
4. Interactions: Purchase -> add to cart; PaperCard -> navigate.
5. Styling: As per detailed_design.

### Dashboard Page
1. Create src/app/dashboard/page.tsx.
2. Protected for STUDENT.
3. Fetch bundles, progress, leaderboard.
4. Render grid BundleCard, ProgressChart sections, LeaderboardTable.
5. Styling: Sections bg-blue-50 p-6 rounded-lg.

### BundlePapers Page
1. Create src/app/bundles/[id]/papers/page.tsx.
2. Fetch papers.
3. Render PaperCard grid.
4. Interactions: Click -> attempt if allowed.

### Progress Page
1. Create src/app/progress/page.tsx.
2. Fetch progress.
3. Render ProgressChart per bundle, table.
4. Styling: Charts Ant Progress customized.

### Leaderboard Page
1. Create src/app/leaderboard/page.tsx.
2. Fetch entries.
3. Render LeaderboardTable.
4. Interactions: Sort columns.

### Cart Page
1. Create src/app/cart/page.tsx.
2. Fetch cart.
3. Render CartItem list, total, checkout button.
4. Checkout: Modal confirm, simulate POST.

## Phase 3: Attempt and Results

### Timer Component
1. Create src/components/Timer.tsx.
2. Props: duration: number, onExpire: () => void.
3. useState for time, useEffect setInterval countdown.
4. Render MM:SS, bg-red-100 text-red-700.
5. Clear interval on unmount.

### QuestionComponent
1. Create src/components/QuestionComponent.tsx.
2. Props: question: QuestionDto, onAnswer: (answer) => void.
3. Conditional: MCQ - Radio.Group for options; Essay - Textarea.
4. Styling: Text font-medium; inputs border focus-blue.

### PaperAttempt Page
1. Create src/app/papers/[id]/attempt/page.tsx.
2. Modal confirm start, POST start attempt.
3. Fetch questions, render sequentially with nav.
4. Timer starts, submit POST answers.
5. Styling: Header with timer, main Card p-6.

### PaperResults Page
1. Create src/app/papers/[id]/results/page.tsx.
2. Fetch AI analyses, overall.
3. Render feedback Cards, overall Card.
4. Styling: Feedback bg-green-50; overall bg-blue-50.

## Phase 4: Admin Management

### ListTable Component
1. Create src/components/ListTable.tsx.
2. Props: columns, data, onAction.
3. Ant Table with striped rows, hover.
4. Actions: edit/delete buttons.

### AdminForm Component
1. Create src/components/AdminForm.tsx.
2. Ant Steps for multi-step.
3. Props: steps, onSubmit.
4. Validate per step.

### SubjectManagement Page
1. Create src/app/admin/subjects/page.tsx.
2. Fetch subjects, render ListTable.
3. Modal for create/edit with form.
4. CRUD via subjectService.

### BundleManagement Page
1. Create src/app/admin/bundles/page.tsx.
2. Stepwise AdminForm: subject select, lesson, bundle details.
3. Submit creates bundle.

### UserList Page
1. Create src/app/admin/users/page.tsx.
2. Fetch users, ListTable with view action.
3. Link to UserDetail.

### UserDetail Page
1. Create src/app/admin/users/[id]/page.tsx.
2. Fetch detail, render profile sections.

## Phase 5: Enhancements

### ProgressBar Component
1. Create src/components/ProgressBar.tsx.
2. Ant Progress for question progress.
3. Props: current, total.

### NotificationModal
1. Create src/components/NotificationModal.tsx.
2. Ant Modal with summary.
3. Props: visible, onClose, content.

### SearchBar
1. Create src/components/SearchBar.tsx.
2. Input with useState, debounce onChange.
3. Props: onSearch.

This breakdown provides granular steps for SDD coding, ensuring each component/page is built incrementally.