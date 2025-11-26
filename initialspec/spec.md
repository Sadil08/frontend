# EduApp Frontend Spec: What and Why

## App Purpose

EduApp is a comprehensive web-based education platform focused on paper-based assessments with AI-powered feedback. It targets students preparing for exams and administrators managing educational content. The platform enables students to access paper bundles for exam preparation, with integrated AI-powered feedback for personalized learning. Admins manage content, while students purchase and attempt papers, receiving detailed analyses to improve performance.

The app serves as a digital library for educational papers, combining e-commerce (bundle purchases), assessment (attempts with timers), analytics (progress/leaderboards), and AI (intelligent feedback). It supports public browsing, authenticated access, and admin management, with future expansions like mobile apps and advanced AI models.

Revenue primarily from bundle purchases, with freemium model (2 free attempts per paper). Stakeholders: Students (access bundles, attempt papers, receive AI feedback), Admins (manage content, monitor usage).

Business Model: Freemium tier allows 2 free attempts per paper; subsequent attempts require bundle purchase. Bundles are sold via e-commerce flow with placeholder payment integration (e.g., Stripe-ready). AI feedback enhances value proposition by providing personalized analysis, encouraging repeat usage and purchases. Analytics and leaderboards foster competition and engagement.

## Features

- **Dashboard**: Student hub showing purchased bundles, progress summaries, and leaderboards.
- **Bundles**: Public browsing with filters; student access to papers after purchase.
- **Papers**: Display in bundles; attempt with timer, MCQ/essay questions.
- **Attempts**: Timed sessions, submit answers, AI analysis triggered.
- **AI Feedback**: Per-question marks/feedback, overall analysis.
- **Progress Tracking**: Completion %, time spent, status per paper.
- **Leaderboards**: Scores with anonymization, opt-in public display.
- **Cart/Checkout**: Add bundles, placeholder payment, grant access.
- **Admin CRUD**: Manage subjects, lessons, bundles, papers, questions/options.
- **User Management**: Admin view all users, detailed profiles with activity.
- **Authentication**: JWT-based login/register, role-based access (STUDENT/ADMIN).
- **Notifications**: Alerts for new bundles, feedback ready (backend-driven).
- **Search/Filtering**: Advanced by exam, subject, lesson, type.

## User Stories

### Admin Stories
- As an admin, I want to create/edit/delete subjects and lessons to organize content.
- As an admin, I want to create paper bundles with metadata (exam type, subject, lesson, past paper flag) and pricing.
- As an admin, I want to add papers to bundles with descriptions and attempt limits.
- As an admin, I want to create questions (MCQ/Essay) with correct answers and options.
- As an admin, I want to view student analytics and progress reports.
- As an admin, I want to view all users and their basic details (email, username, role, created date).
- As an admin, I want to view detailed information for a specific user, including accessed paper bundles, attempted papers, progress, scores, and AI feedback summaries.

### Student Stories
- As a student, I want to browse public paper bundles and filter by exam, subject, lesson, or type.
- As a student, I want to view bundle details and add to cart.
- As a student, I want to purchase bundles and access them in my dashboard.
- As a student, I want to attempt papers (up to 2 free, then pay for more).
- As a student, I want to receive detailed AI feedback per question and overall analysis per paper.
- As a student, I want to track my progress and view leaderboards.

### Additional Stories
- Progress Tracking: Completion percentage, time spent per bundle/paper. Status per paper (NOT_ATTEMPTED, ATTEMPTED).
- Leaderboards: Aggregate scores, anonymize. Students opt-in to share paper-wise marks publicly; else anonymous to self.
- Notifications: Alerts for new bundles, attempt limits, feedback availability. Email via SendGrid.
- Advanced Search/Filtering: By multiple criteria.
- Versioning: Track changes to papers/bundles.
- Cart/Checkout: Basic e-commerce flow with placeholder payment endpoints for easy integration (e.g., Stripe later).
- Timer: Starts on paper view, stops on submit, displays time taken.
- User Management for Admins: View all users, detailed user profiles with accessed bundles, attempted papers, progress, scores, and AI feedback summaries.

## Flows

### Student Flows
- **Public Browsing**: Visit /, browse bundles with filters, click bundle -> /bundles/[id] (description only if no access).
- **Authentication**: Login/register via /login or /register, JWT stored, redirect to /dashboard.
- **Dashboard Access**: /dashboard shows bundles, progress, leaderboards; click bundle -> /bundles/[id]/papers.
- **Bundle Interaction**: /bundles/[id]/papers lists papers; click paper -> /papers/[id]/attempt (modal confirm, timer starts).
- **Attempt Flow**: Questions sequential (MCQ radios, essay textarea); nav prev/next; submit modal -> POST answers, redirect /papers/[id]/results.
- **Results**: Display AI feedback per question and overall.
- **Progress/Leaderboard**: /progress shows charts/tables; /leaderboard shows rankings.
- **Purchase Flow**: Add to cart from bundle detail, /cart checkout (placeholder), grant access.

### Admin Flows
- **Authentication**: Login as admin, redirect /admin.
- **Content Management**: /admin overview; stepwise create: subject -> lesson -> bundle (details) -> paper -> question (type, options if MCQ).
- **CRUD Operations**: Management pages for subjects/lessons/bundles/papers/questions; lists with edit/delete, modals for forms.
- **User Monitoring**: /admin/users list; click user -> /admin/users/[id] detailed profile.
- **Attempt Papers**: Admins can attempt any paper for testing.

### Additional Flows
- **Error Handling**: API errors show messages, 401 redirect login.
- **Responsive**: Mobile stacks grids, admin forms vertical steps.
- **Loading**: Spinners during fetches, disabled buttons on submit.