# EduApp Frontend Architecture Specification

## App Overview/Purpose

EduApp is a comprehensive web-based education platform focused on paper-based assessments with AI-powered feedback. It targets students preparing for exams and administrators managing educational content. The platform enables students to access paper bundles for exam preparation, with integrated AI-powered feedback for personalized learning. Admins manage content, while students purchase and attempt papers, receiving detailed analyses to improve performance.

The app serves as a digital library for educational papers, combining e-commerce (bundle purchases), assessment (attempts with timers), analytics (progress/leaderboards), and AI (intelligent feedback). It supports public browsing, authenticated access, and admin management, with future expansions like mobile apps and advanced AI models.

Revenue primarily from bundle purchases, with freemium model (2 free attempts per paper). Stakeholders: Students (access bundles, attempt papers, receive AI feedback), Admins (manage content, monitor usage).

Business Model: Freemium tier allows 2 free attempts per paper; subsequent attempts require bundle purchase. Bundles are sold via e-commerce flow with placeholder payment integration (e.g., Stripe-ready). AI feedback enhances value proposition by providing personalized analysis, encouraging repeat usage and purchases. Analytics and leaderboards foster competition and engagement.

## User Flows/Stories

### Student Flows
- **Public Browsing**: User visits home page, browses public bundle list with filters (exam type, subject, lesson, type). Clicks bundle to view description; if not purchased, sees description only; if purchased, sees papers list.
- **Authentication**: Registers or logs in via /login or /register; JWT stored for session.
- **Dashboard Access**: After login, redirected to /dashboard showing purchased bundles (with descriptions), progress summaries (completion %, time spent), and leaderboards (opt-in public scores).
- **Bundle Interaction**: From dashboard or public, clicks bundle -> /bundles/[id]/papers; lists papers with details (name, description, maxFreeAttempts). Clicks paper -> /papers/[id]/attempt; modal confirms start attempt; upon confirmation, timer starts (from paper start), questions load sequentially.
- **Attempt Flow**: Questions render based on type: MCQ shows options for selection; Essay shows text area for input. User navigates questions, submits all at once. On submit, POST answers, trigger AI analysis (backend handles), redirect to /papers/[id]/results showing per-question feedback (marks, feedback, lessons to review) and overall analysis (total marks, overall feedback, lessons lacking).
- **Progress/Leaderboard**: /progress shows detailed progress per bundle/paper; /leaderboard shows rankings (anonymous unless opted-in).
- **Purchase Flow**: From bundle detail or cart, add to cart (/cart), proceed to checkout (placeholder payment endpoint, e.g., simulate success).

### Admin Flows
- **Authentication**: Admins log in via same /login (role check in JWT).
- **Content Management**: /admin dashboard overview. Stepwise upload: Select/create subject (/admin/subjects), select/create lesson (/admin/lessons), create bundle (/admin/bundles with metadata), add papers (/admin/papers), add questions (/admin/questions with type), for MCQ add options (text, correct flag, order).
- **CRUD Operations**: Full CRUD for subjects, lessons, bundles, papers, questions via respective management pages; lists with edit/delete, forms for create/update.
- **User Monitoring**: /admin/users lists all users; click user -> /admin/users/[id] shows detailed profile (accessed bundles, attempted papers, progress, scores, AI feedback summaries).
- **Attempt Papers**: Admins can view/attempt any paper like students for testing.

### Additional Stories
- Progress Tracking: Automatic updates on attempt completion; status NOT_ATTEMPTED/ATTEMPTED, completion %, time spent.
- Leaderboards: Aggregate scores; students opt-in for public display; else anonymous.
- Notifications: Alerts for new bundles, attempt limits, feedback ready (via backend, frontend polls or websockets future).
- Advanced Search/Filtering: Public bundle list with multi-criteria filters.
- Versioning: Track changes (backend; frontend shows latest).
- Cart/Checkout: Basic e-commerce; add bundles, view cart, placeholder payment (POST to simulate, update access).

## Pages/Views Structure

| Page | Route | Purpose | Access Control | Views/Logic |
|------|-------|---------|---------------|-------------|
| Home | / | Public bundle list with filters/search. Displays BundleCard components. | Public | Fetches GET /api/paper-bundles; filters by query params; if logged in, shows purchase status; links to /bundles/[id]. |
| Bundle Detail | /bundles/[id] | Shows bundle description; if access, lists papers; else description only. | Public | Fetches GET /api/paper-bundles/{id}; checks access via GET /api/student-bundle-accesses (filter by user/bundle); if access, show PaperCard list linking to /papers/[id]/attempt; else show description and purchase button. |
| Login | /login | Student/Admin login form. | Public | Form with email/password; POST /api/auth/login; on success, store JWT, redirect to /dashboard or /admin based on role. |
| Register | /register | Student registration form. | Public | Form with email/password/name; POST /api/auth/register; on success, store JWT, redirect to /dashboard. |
| Dashboard | /dashboard | Student dashboard: purchased bundles, progress, leaderboards. | Authenticated (STUDENT) | Fetches GET /api/student-bundle-accesses (user bundles), GET /api/progress (user progress), GET /api/leaderboard-entries (user scores); displays BundleCard for bundles, progress summaries, leaderboard table. |
| Bundle Papers | /bundles/[id]/papers | Lists papers in bundle. | Authenticated (STUDENT), access check | Fetches GET /api/papers?bundleId={id}; displays PaperCard with attempt status (from GET /api/student-paper-attempts filter by user/paper); links to /papers/[id]/attempt if attempts < maxFree or purchased. |
| Paper Attempt | /papers/[id]/attempt | Timed paper attempt; sequential questions. | Authenticated (STUDENT), access check | On load, modal "Start Attempt?"; confirm -> POST /api/student-paper-attempts (start attempt), start Timer component; fetches GET /api/questions?paperId={id}; renders QuestionComponent per question; on submit, POST /api/student-answers for each, then redirect to results. |
| Paper Results | /papers/[id]/results | AI feedback display. | Authenticated (STUDENT), post-attempt | Fetches GET /api/ai-analyses (filter by attempt), GET /api/overall-paper-analyses (filter by attempt); displays per-question feedback and overall analysis. |
| Progress | /progress | Detailed progress view. | Authenticated (STUDENT) | Fetches GET /api/progress (user); displays per bundle/paper status, completion %, time. |
| Leaderboard | /leaderboard | Rankings display. | Authenticated (STUDENT) | Fetches GET /api/leaderboard-entries; displays table with scores, anonymized unless opted-in. |
| Cart | /cart | Cart and checkout. | Authenticated (STUDENT) | Fetches GET /api/carts (user); displays bundles; placeholder checkout button (simulate POST payment, update access). |
| Admin Dashboard | /admin | Admin overview. | Authenticated (ADMIN) | Displays counts from GET /api/admin/users, /api/paper-bundles, etc.; links to management pages. |
| User List | /admin/users | List all users. | Authenticated (ADMIN) | Fetches GET /api/admin/users; displays table with id, name, email, role; links to /admin/users/[id]. |
| User Detail | /admin/users/[id] | Detailed user profile. | Authenticated (ADMIN) | Fetches GET /api/admin/users/{id}; displays profile, accessedBundles, attemptedPapers, progress, scores, aiFeedbackSummaries. |
| Subject Management | /admin/subjects | CRUD subjects. | Authenticated (ADMIN) | Fetches GET /api/subjects; displays list with edit/delete; forms for create/update (name, description). |
| Lesson Management | /admin/lessons | CRUD lessons. | Authenticated (ADMIN) | Fetches GET /api/lessons; displays list with edit/delete; forms for create/update (name, description, subjectId from dropdown GET /api/subjects). |
| Bundle Management | /admin/bundles | CRUD bundles. | Authenticated (ADMIN) | Fetches GET /api/paper-bundles; displays list with edit/delete; stepwise form: select subject/lesson, then bundle details (name, desc, price, type, examType, isPastPaper). |
| Paper Management | /admin/papers | CRUD papers. | Authenticated (ADMIN) | Fetches GET /api/papers; displays list with edit/delete; form: bundleId (dropdown from GET /api/paper-bundles), name, desc, maxFreeAttempts. |
| Question Management | /admin/questions | CRUD questions/options. | Authenticated (ADMIN) | Fetches GET /api/questions; displays list with edit/delete; stepwise: select paper, question details (text, type), if MCQ add options (text, isCorrect, order). |

## Components

- **BundleCard**: Displays bundle name, description, price, type, examType, isPastPaper; conditional purchase button or "View Papers"; links to /bundles/[id]; used in Home, Dashboard.
- **PaperCard**: Displays paper name, description, maxFreeAttempts, attempt status; link to /papers/[id]/attempt if accessible; used in BundleDetail, BundlePapers.
- **QuestionComponent**: Renders question text; if MCQ, radio buttons for options (fetched GET /api/question-options?questionId); if Essay, textarea; collects answer; used in PaperAttempt.
- **Timer**: Countdown component; starts on attempt start, displays time remaining; on expire, auto-submit; updates every second; used in PaperAttempt.
- **AdminForm**: Multi-step form component; steps for subject select/create, lesson, bundle, paper, question, options; uses Ant Design Form/Steps; validates inputs; submits to respective POST endpoints; used in management pages.
- **ListTable**: Reusable table for CRUD lists; columns for entity fields, actions (edit/delete); used in all management pages.
- **AuthForm**: Login/Register form; fields for email, password, name (register); handles submission; used in Login, Register.
- **ProgressChart**: Visual chart for completion %; uses Ant Design Progress; used in Dashboard, Progress.
- **LeaderboardTable**: Table for scores; columns user (anonymized), score, subject; used in Dashboard, Leaderboard.
- **NotificationList**: Displays user notifications; fetches GET /api/notifications; used in layout or dashboard.
- **CartItem**: Displays bundle in cart; remove button; used in Cart.

## Utils/Services

- **apiClient (utils/apiClient.ts)**: Axios instance with baseURL from env, interceptors for JWT (add to headers), response error handling (401 logout, show error messages via Ant Design message).
- **authService (services/authService.ts)**: login(email, password): POST /api/auth/login, store token; register(data): POST /api/auth/register, store token; logout(): clear token; getUser(): decode JWT for role/id.
- **bundleService (services/bundleService.ts)**: getBundles(filters): GET /api/paper-bundles with params; getBundle(id): GET /api/paper-bundles/{id}; createBundle(data): POST /api/paper-bundles; updateBundle(id, data): PUT /api/paper-bundles/{id}; deleteBundle(id): DELETE /api/paper-bundles/{id}.
- **paperService (services/paperService.ts)**: getPapers(bundleId): GET /api/papers?bundleId; getPaper(id): GET /api/papers/{id}; createPaper(data): POST /api/papers; updatePaper(id, data): PUT /api/papers/{id}; deletePaper(id): DELETE /api/papers/{id}.
- **questionService (services/questionService.ts)**: getQuestions(paperId): GET /api/questions?paperId; createQuestion(data): POST /api/questions; updateQuestion(id, data): PUT /api/questions/{id}; deleteQuestion(id): DELETE /api/questions/{id}; getOptions(questionId): GET /api/question-options?questionId; createOption(data): POST /api/question-options; deleteOption(id): DELETE /api/question-options/{id}.
- **attemptService (services/attemptService.ts)**: startAttempt(data): POST /api/student-paper-attempts; submitAnswer(data): POST /api/student-answers; getAttempts(userId): GET /api/student-paper-attempts?studentId; getResults(attemptId): GET /api/ai-analyses?attemptId + GET /api/overall-paper-analyses?attemptId.
- **progressService (services/progressService.ts)**: getProgress(userId): GET /api/progress?userId; updateProgress(data): POST /api/progress.
- **leaderboardService (services/leaderboardService.ts)**: getEntries(): GET /api/leaderboard-entries; createEntry(data): POST /api/leaderboard-entries.
- **cartService (services/cartService.ts)**: getCart(userId): GET /api/carts?userId; addToCart(data): POST /api/carts; checkout(data): placeholder POST to payment endpoint, then POST /api/student-bundle-accesses.
- **adminService (services/adminService.ts)**: getUsers(): GET /api/admin/users; getUserDetail(id): GET /api/admin/users/{id}; createAdmin(data): POST /api/admin/create; CRUD for subjects, lessons via respective services.
- **subjectService (services/subjectService.ts)**: getSubjects(): GET /api/subjects; createSubject(data): POST /api/subjects; updateSubject(id, data): PUT /api/subjects/{id}; deleteSubject(id): DELETE /api/subjects/{id}.
- **lessonService (services/lessonService.ts)**: getLessons(): GET /api/lessons; createLesson(data): POST /api/lessons; updateLesson(id, data): PUT /api/lessons/{id}; deleteLesson(id): DELETE /api/lessons/{id}.

## Backend Integrations

| Page/Component | API Call | Method | URL | Request Body | Response Handling | Error Handling |
|---------------|----------|--------|-----|--------------|-------------------|----------------|
| Home | Fetch bundles | GET | /api/paper-bundles | Query params for filters | Parse List<PaperBundleDto>, render BundleCard list | 401: redirect login; 500: show error message |
| BundleDetail | Fetch bundle | GET | /api/paper-bundles/{id} | None | Parse PaperBundleDto, check access via separate call | 404: not found; 403: no access |
| BundleDetail | Check access | GET | /api/student-bundle-accesses | Query userId, bundleId | If exists, show papers; else description | 401: no auth |
| Login | Authenticate | POST | /api/auth/login | {email, password} | Parse JwtResponse, store token, set user context | 400: invalid creds; 500: server error |
| Register | Register | POST | /api/auth/register | {email, password, name} | Parse UserResponse, store token, set user context | 400: validation error; 409: email exists |
| Dashboard | Fetch accesses | GET | /api/student-bundle-accesses | Query userId | Parse List<StudentBundleAccess>, render bundles | 401: redirect login |
| Dashboard | Fetch progress | GET | /api/progress | Query userId | Parse List<ProgressDto>, render summaries | 401: redirect login |
| Dashboard | Fetch leaderboard | GET | /api/leaderboard-entries | Query userId | Parse List<LeaderboardEntryDto>, render table | 401: redirect login |
| BundlePapers | Fetch papers | GET | /api/papers | Query bundleId | Parse List<PaperDto>, render PaperCard list | 403: no access |
| PaperAttempt | Start attempt | POST | /api/student-paper-attempts | {studentId, paperId, attemptNumber} | Parse StudentPaperAttemptDto, start timer | 400: max attempts; 403: no access |
| PaperAttempt | Fetch questions | GET | /api/questions | Query paperId | Parse List<QuestionDto>, render sequentially | 403: no access |
| PaperAttempt | Submit answers | POST | /api/student-answers | Array of {attemptId, questionId, answerText/selectedOptionId} | Success: redirect results; triggers AI backend | 400: validation; 500: submit failed |
| PaperResults | Fetch AI analyses | GET | /api/ai-analyses | Query attemptId | Parse List<AIAnalysisDto>, render feedback | 404: not ready |
| PaperResults | Fetch overall | GET | /api/overall-paper-analyses | Query attemptId | Parse OverallPaperAnalysis, render summary | 404: not ready |
| Progress | Fetch progress | GET | /api/progress | Query userId | Parse List<ProgressDto>, render charts/tables | 401: redirect login |
| Leaderboard | Fetch entries | GET | /api/leaderboard-entries | None | Parse List<LeaderboardEntryDto>, render table | 401: redirect login |
| Cart | Fetch cart | GET | /api/carts | Query userId | Parse Cart, render items | 401: redirect login |
| Cart | Checkout | POST | /api/student-bundle-accesses | {studentId, bundleId, paymentId} | Success: update access, redirect dashboard | 400: payment failed |
| AdminDashboard | Fetch counts | GET | /api/admin/users + /api/paper-bundles | None | Count responses, display | 403: not admin |
| UserList | Fetch users | GET | /api/admin/users | None | Parse List<UserResponse>, render table | 403: not admin |
| UserDetail | Fetch detail | GET | /api/admin/users/{id} | None | Parse UserDetailDto, render profile | 403: not admin; 404: not found |
| SubjectManagement | CRUD | GET/POST/PUT/DELETE | /api/subjects | SubjectDto | Parse responses, update list | 400: validation; 403: not admin |
| LessonManagement | CRUD | GET/POST/PUT/DELETE | /api/lessons | LessonDto | Parse responses, update list | 400: validation; 403: not admin |
| BundleManagement | CRUD | GET/POST/PUT/DELETE | /api/paper-bundles | PaperBundleDto | Parse responses, update list | 400: validation; 403: not admin |
| PaperManagement | CRUD | GET/POST/PUT/DELETE | /api/papers | PaperDto | Parse responses, update list | 400: validation; 403: not admin |
| QuestionManagement | CRUD questions | GET/POST/PUT/DELETE | /api/questions | QuestionDto | Parse responses, update list | 400: validation; 403: not admin |
| QuestionManagement | CRUD options | GET/POST/DELETE | /api/question-options | QuestionOptionDto | Parse responses, update options | 400: validation; 403: not admin |

## Auth/Security

Authentication uses JWT tokens stored in localStorage. AuthContext (React context) manages user state (id, role, email) by decoding token on app load. Protected routes check role: STUDENT for student pages, ADMIN for admin pages; unauthenticated redirect to /login. API calls include Authorization header with Bearer token. Logout clears token and redirects to /. Role-based access: backend enforces via JWT claims; frontend checks role for UI (e.g., hide admin links for students). Security: HTTPS assumed, no sensitive data in client, CSRF via JWT.

## Efficiency Considerations

- **Stepwise Admin Forms**: Admin uploads use multi-step forms (Ant Design Steps) to break complex creation (bundle->paper->question->options) into manageable steps, reducing form complexity and improving UX; each step validates before proceeding.
- **Lazy Loading**: Questions in PaperAttempt load on demand (e.g., fetch next question); bundles/papers paginate with infinite scroll for large lists.
- **Caching**: API responses cached in React Query (future) or local state for frequent data (subjects, lessons); invalidate on CRUD.
- **Performance**: Use Next.js SSR for public pages; client-side for auth pages. Bundle splitting for admin routes. Timer uses setInterval efficiently, clears on unmount.
- **Error Handling**: Centralized in apiClient interceptor; user-friendly messages via Ant Design notification; retry logic for network errors.
- **Scalability**: Modular services allow easy addition of new endpoints; components reusable across pages.
- **Accessibility**: Ant Design provides a11y; forms with labels, keyboard nav; timer announces expiry.
- **Testing**: Unit tests for services/utils; integration for components with mock APIs.

This architecture ensures spec-driven development, mapping directly to backend docs, with efficient user flows and scalable structure.