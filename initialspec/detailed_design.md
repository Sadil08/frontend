# EduApp Frontend Detailed Design Specification

## Overview

EduApp is a Next.js 14.2.4 application with TypeScript, Ant Design 5.22.4, and Tailwind CSS 3.4.1 for styling. This design spec details pages, components, and styling for a clean, user-attracting interface. Focus on spec-driven UI/UX from backend docs, ensuring modular, reusable code. Key features: Student dashboard with bundle access, timed paper attempts with MCQ/essay questions, AI feedback display; Admin CRUD with stepwise forms. Integrations via Axios 1.7.9, React hooks for state. Responsive design for education context, emphasizing calm UX to reduce anxiety and boost focus.

## Styling Guidelines

### Versions and Patterns
- **Next.js**: 14.2.4 with App Router for routing.
- **Ant Design**: 5.22.4 for UI components (Card, Button, Form, Table, Modal); customized with Tailwind classes via tailwindcss-antd plugin for consistency.
- **Tailwind CSS**: 3.4.1 for utility-first styling; responsive grids (grid-cols-1 md:grid-cols-2 lg:grid-cols-3), spacing (p-4, m-2), colors, shadows.
- **Integration**: Ant components wrapped in Tailwind divs (e.g., <div className="bg-blue-50"><Card className="border-none shadow-md">...</Card></div>); avoid conflicts by prioritizing Tailwind for layout, Ant for interactive elements.
- **Consistent Patterns**: All cards use shadow-md border rounded-lg bg-white; buttons primary: bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded; secondary: bg-gray-200 hover:bg-gray-300; forms with label text-sm font-medium, input border-gray-300 focus:border-blue-500; tables striped rows, hover effects; modals centered, overlay dark bg-black/50.
- **Responsive**: Mobile-first; grids stack on small screens, flex on larger; text scales (text-sm md:text-base); touch-friendly buttons (min-h-10).

### Psych Basis
Blue-green calm palette (bg-blue-50, text-green-700, accents teal-500) based on psych research: Blues reduce anxiety (calming effect), greens enhance focus and retention (associated with growth/learning). Minimalism (white space, clean layouts) lowers cognitive load; progressive reveals (stepwise forms, sequential questions) motivate engagement. Feedback loops (loading spinners, success messages) build trust; consistent patterns create familiarity, reducing decision fatigue.

## Pages

### Dashboard (/dashboard)
- **Layout**: Header (nav links: Progress, Leaderboard, Cart; logout); main content: grid of BundleCard (3 cols lg, 2 md, 1 sm); below, ProgressChart section (title "Your Progress", charts per bundle); LeaderboardTable section (title "Top Scores", table with anonymized names).
- **Interactions**: BundleCard click -> /bundles/[id]/papers; progress hover shows details; leaderboard sort by score; refresh button fetches latest data.
- **Styling**: Container max-w-7xl mx-auto p-4; grid gap-4; sections bg-blue-50 p-6 rounded-lg shadow-md; titles text-xl font-semibold text-green-700.

### BundleDetail (/bundles/[id])
- **Layout**: Header; bundle info Card (name, desc, price, type, examType, isPastPaper); conditional: if access, PaperCard grid below; else purchase button (links to /cart).
- **Interactions**: Purchase click adds to cart; PaperCard click -> /papers/[id]/attempt; back button to /.
- **Styling**: Card bg-white shadow-md rounded-lg p-6; grid gap-4; button primary variant.

### BundlePapers (/bundles/[id]/papers)
- **Layout**: Header; title "Papers in [Bundle Name]"; grid of PaperCard (attempt status, link if accessible).
- **Interactions**: PaperCard click -> attempt if allowed; else modal "Purchase required".
- **Styling**: Grid responsive; cards consistent.

### PaperAttempt (/papers/[id]/attempt)
- **Layout**: Header with Timer (top-right); main: QuestionComponent (question text, MCQ radios/Essay textarea); nav buttons (Prev/Next); bottom: Submit button (modal confirm).
- **Interactions**: Start modal on load; timer counts down, auto-submit on 0; question nav updates state; submit POST answers, redirect results.
- **Styling**: Timer bg-red-100 text-red-700 font-mono; question Card bg-white p-6; buttons spaced.

### PaperResults (/papers/[id]/results)
- **Layout**: Header; sections: per-question feedback (list of Cards with marks, feedback, lessons); overall analysis Card (total marks, feedback, lacking).
- **Interactions**: Scrollable; back to dashboard.
- **Styling**: Feedback Cards bg-green-50 border-green-200; overall bg-blue-50.

### Progress (/progress)
- **Layout**: Header; list of ProgressChart per bundle/paper; table with status, completion %, time.
- **Interactions**: Filter by bundle; export button (future).
- **Styling**: Charts Ant Progress customized; table striped.

### Leaderboard (/leaderboard)
- **Layout**: Header; LeaderboardTable full-width.
- **Interactions**: Sort columns; opt-in toggle (future).
- **Styling**: Table hover rows bg-blue-50.

### Cart (/cart)
- **Layout**: Header; list of CartItem; total price; checkout button (placeholder modal).
- **Interactions**: Remove item; checkout simulates payment, updates access.
- **Styling**: Items bg-white shadow-md; total text-lg font-bold.

### Home (/)
- **Layout**: Header; filters (dropdowns for subject, lesson, type); grid of BundleCard; search bar.
- **Interactions**: Filter updates query; search debounced; card click -> detail.
- **Styling**: Filters flex wrap; search input border rounded.

### Login (/login)
- **Layout**: Centered AuthForm (email, password); link to register.
- **Interactions**: Submit POST, redirect based on role.
- **Styling**: Form Card bg-white shadow-lg p-8; button full-width.

### Register (/register)
- **Layout**: Similar to login, + name field.
- **Interactions**: Submit POST, redirect dashboard.
- **Styling**: Consistent.

### AdminDashboard (/admin)
- **Layout**: Header; cards with counts (users, bundles); links to management.
- **Interactions**: Click links.
- **Styling**: Cards grid, bg-blue-50.

### UserList (/admin/users)
- **Layout**: Header; ListTable with columns id, name, email, role, actions (view).
- **Interactions**: View click -> detail; search filter.
- **Styling**: Table full-width.

### UserDetail (/admin/users/[id])
- **Layout**: Header; profile Card; sections for bundles, attempts, progress, scores, feedback.
- **Interactions**: Expandable sections.
- **Styling**: Sections bg-gray-50 p-4.

### SubjectManagement (/admin/subjects)
- **Layout**: Header; ListTable + create button; modal for edit/create.
- **Interactions**: CRUD via modal forms.
- **Styling**: Modal centered.

### LessonManagement (/admin/lessons)
- **Layout**: Similar; dropdown for subjectId.
- **Interactions**: Select subject before create.
- **Styling**: Consistent.

### BundleManagement (/admin/bundles)
- **Layout**: Header; ListTable; AdminForm stepwise (subject select, lesson, bundle details).
- **Interactions**: Steps validate; submit creates.
- **Styling**: Form Steps component.

### PaperManagement (/admin/papers)
- **Layout**: Header; ListTable; form with bundleId dropdown.
- **Interactions**: CRUD.
- **Styling**: Consistent.

### QuestionManagement (/admin/questions)
- **Layout**: Header; ListTable; AdminForm stepwise (paper select, question, if MCQ options).
- **Interactions**: Add options dynamically.
- **Styling**: Options list editable.

## General Components

- **Header**: Nav bar with logo (EduApp text), links (Home, Dashboard if auth), auth buttons (Login/Register or Logout); responsive collapse menu. Props: user (for conditional). Styling: bg-blue-600 text-white flex justify-between p-4; links hover:bg-blue-700.
- **Footer**: Links (About, Contact), copyright. Styling: bg-gray-100 text-gray-600 p-4 text-center.
- **Button**: Variants primary/secondary/danger; uses Ant Button customized. Props: variant, onClick. Styling: As per patterns; disabled opacity-50.
- **Table**: Reusable for lists; props: columns, data, onAction. Styling: Ant Table with Tailwind classes for rows.

## Specific Components

### Per Page/Feature
- **BundleCard** (Home, Dashboard, BundleDetail): Card with title, desc, price, badges (type, examType); button "View" or "Purchase". Props: bundle, hasAccess. Styling: bg-white shadow-md rounded-lg p-4; button primary. Usage: Displays bundle info, links appropriately.
- **PaperCard** (BundleDetail, BundlePapers): Card with name, desc, attempts left; button "Attempt" if accessible. Props: paper, attempts. Styling: Consistent card; button conditional enabled.
- **QuestionComponent** (PaperAttempt): Conditional render: MCQ - text + Ant Radio.Group for options; Essay - text + Textarea. Props: question, onAnswer. Styling: Text font-medium; inputs border focus-blue.
- **Timer** (PaperAttempt): Displays MM:SS countdown; props: duration, onExpire. Styling: bg-red-100 text-red-700 p-2 rounded font-mono. Usage: Starts on attempt, updates every second.
- **ProgressChart** (Dashboard, Progress): Ant Progress bar; props: percent, title. Styling: bg-blue-50 p-4.
- **LeaderboardTable** (Dashboard, Leaderboard): Ant Table; columns: Rank, User (anonymized), Score, Subject. Props: data. Styling: Hover rows.
- **CartItem** (Cart): Card with bundle name, price, remove button. Props: item, onRemove. Styling: Consistent.
- **AuthForm** (Login, Register): Ant Form with inputs; props: isRegister. Styling: Fields mb-4.
- **ListTable** (Admin pages): As general, with edit/delete actions. Props: entity, data. Styling: Actions buttons small.
- **AdminForm** (Bundle, Question management): Ant Steps with forms per step; props: steps, onSubmit. Styling: Steps vertical on mobile.

### Suggestions
- **ProgressBar** (PaperAttempt): Ant Progress for question progress (e.g., 3/10). Justify: Improves UX by showing completion, motivates users; code: Reusable hook for current question index.
- **NotificationModal** (PaperResults): Modal for AI feedback summary on load. Justify: Attracts attention to results, better feedback loop; code: Ant Modal with custom content.
- **SearchBar** (Home, admin lists): Input with debounce; props: onSearch. Justify: Enhances filtering for large lists, better UX; code: Reusable with useState for query.

## Integrations/Flows

- **Auth Flow**: Login/Register sets JWT in localStorage, AuthContext updates user; protected routes use HOC check role, redirect /login.
- **Attempt Flow**: Modal confirm -> POST start attempt -> fetch questions -> render sequentially -> submit POST answers array -> redirect results -> fetch AI analyses.
- **Admin CRUD Flow**: List fetch on load; create/edit modal with form validation; submit POST/PUT, refresh list; delete confirm modal.
- **Cart Flow**: Add via button -> POST cart -> fetch on Cart page -> checkout placeholder POST payment -> POST access -> redirect dashboard.
- **Error Handling**: ApiClient interceptor shows Ant message on error; 401 logout; loading states with Ant Spin.
- **Responsive Flow**: Use Tailwind breakpoints; admin forms stack steps on mobile.

This design ensures clean, consistent, user-attracting interface with psych-backed styling, modular components for maintainability.

## Implemented Services
- **bundleService**: Handles bundle retrieval.
- **paperService**: Handles papers, attempts, and results.
- **cartService**: Handles cart operations and checkout.
- **adminService**: Handles all admin CRUD operations.
- **leaderboardService**: Handles leaderboard data.
- **progressService**: Handles user progress data.
- **authService**: Handles authentication.