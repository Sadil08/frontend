# View Past Attempts Feature - Specification

## Feature Overview

### Purpose
The "View Past Attempts" feature enables students to comprehensively review their previous paper attempts, including detailed question-by-question analysis with correct answers, marks, and AI feedback. This enhances learning by providing immediate feedback and helping students understand their performance patterns.

### Key Benefits
- **Learning Enhancement**: Students can review correct answers and AI feedback
- **Progress Tracking**: Visual representation of improvement over multiple attempts
- **Detailed Analysis**: Question-by-question breakdown with performance metrics
- **Study Guidance**: AI feedback helps identify areas for improvement

## User Stories

### Primary User Stories

#### US-1: View Attempt Summary
**As a** student  
**I want to** see a list of all my previous attempts for a paper  
**So that** I can quickly review my progress and select an attempt to examine in detail

**Acceptance Criteria:**
- [ ] Display all attempts for the selected paper in chronological order (newest first)
- [ ] Show attempt number, completion date, total marks, and completion time
- [ ] Display overall feedback summary (truncated to 200 characters)
- [ ] Include performance percentage based on total possible marks
- [ ] Indicate attempt status (SUBMITTED, IN_PROGRESS, etc.)
- [ ] Show latest attempt with special "Latest" badge
- [ ] Handle empty state with call-to-action to start first attempt

#### US-2: Access Attempt Details
**As a** student  
**I want to** view detailed breakdown of a specific attempt  
**So that** I can understand what I answered correctly/incorrectly and learn from my mistakes

**Acceptance Criteria:**
- [ ] Display attempt summary (total score, time taken, completion date)
- [ ] Show overall AI feedback prominently
- [ ] List all questions with student answers, correct answers, and marks received
- [ ] Display AI feedback for each individual question
- [ ] Highlight correct/incorrect/partial answers with visual indicators
- [ ] Support both MCQ and essay question formats
- [ ] Allow navigation back to attempt history list

#### US-3: Enhanced Paper Details Page
**As a** student  
**I want to** easily access my attempt history from the paper details page  
**So that** I can quickly review my progress without additional navigation

**Acceptance Criteria:**
- [ ] Add prominent "View Past Attempts" button on paper details page
- [ ] Button should be placed near the "Start New Attempt" button
- [ ] Button shows attempt count badge if attempts exist
- [ ] Smooth transition to attempt history view
- [ ] Maintain paper context and breadcrumbs

#### US-4: Performance Analytics
**As a** student  
**I want to** see performance trends across my attempts  
**So that** I can track my improvement and identify learning patterns

**Acceptance Criteria:**
- [ ] Show performance trend indicators (improving/declining/stable)
- [ ] Display attempt number badges with visual performance indicators
- [ ] Highlight best and most recent attempts
- [ ] Show completion time trends
- [ ] Provide visual feedback on performance changes

### Secondary User Stories

#### US-5: Responsive Design
**As a** student using mobile/tablet  
**I want to** view my attempts seamlessly on any device  
**So that** I can review my progress anywhere

#### US-6: Fast Loading
**As a** student  
**I want to** quickly access my attempt history  
**So that** I don't waste time waiting for data to load

#### US-7: Accessibility
**As a** student with disabilities  
**I want to** navigate attempts using keyboard/screen reader  
**So that** I can independently review my progress

## Functional Requirements

### API Integration

#### Endpoint 1: Get Attempt History (Summary List)
```
GET /api/student-paper-attempts/paper/{paperId}/history
```

**Request Headers:**
- Authorization: Bearer {jwt_token}

**Response Format:**
```typescript
[
  {
    "id": 53,
    "attemptNumber": 6,
    "status": "SUBMITTED",
    "completedAt": "2025-11-28T07:39:02.743675",
    "timeTakenMinutes": 1,
    "totalMarks": 3,
    "overallFeedbackSummary": "Excellent start! The first question was answered correctly..."
  }
]
```

#### Endpoint 2: Get Full Attempt Details
```
GET /api/papers/attempts/{attemptId}
```

**Request Headers:**
- Authorization: Bearer {jwt_token}

**Response Format:**
```typescript
{
  "id": 53,
  "studentId": 2,
  "paperId": 9,
  "attemptNumber": 6,
  "status": "SUBMITTED",
  "startedAt": "2025-11-28T07:38:02.743625",
  "completedAt": "2025-11-28T07:39:02.743675",
  "timeTakenMinutes": 1,
  "totalMarks": 3,
  "overallFeedback": "Excellent start! The first question was answered correctly, demonstrating a solid understanding of basic linear equation properties. Keep up the good work.",
  "answers": [
    {
      "id": 61,
      "attemptId": 53,
      "questionId": 22,
      "questionText": "What is the slope of y=3x+2",
      "answerText": "I will say that the answer is 3",
      "selectedOptionId": null,
      "submittedAt": "2025-11-28T07:38:45.123456",
      "marksAwarded": 3,
      "marksAvailable": 3,
      "aiFeedback": "Correct. The equation y=3x+2 is in the slope-intercept form (y = mx + c), where 'm' represents the slope. In this equation, 'm' is 3, making 3 the correct slope.",
      "correctAnswerText": "3",
      "correctOptionId": null,
      "correctOptionText": null
    }
  ]
}
```

**Component Integration Note**: The `answers` array uses the existing `StudentAnswerDto` interface from `src/types/index.ts`. This means the existing `QuestionReview.tsx` component in `src/components/QuestionReview.tsx` can be leveraged directly for displaying question details, providing question-by-question breakdown with student answers, correct answers, marks, and AI feedback.

### Error Handling

#### Authentication Errors
- **401 Unauthorized**: Redirect to login page
- **403 Forbidden**: Show "You don't have permission to view this attempt" message
- **404 Not Found**: Show "Attempt not found" message

#### Network Errors
- **Timeout**: Show retry button with timeout message
- **Network Error**: Show "Connection error" with retry option
- **Server Error**: Show "Something went wrong" with support information

### State Management

#### Attempt History State
```typescript
interface AttemptHistoryState {
  attempts: StudentPaperAttemptDto[];
  loading: boolean;
  error: string | null;
  selectedAttemptId: number | null;
}
```

#### Attempt Details State  
```typescript
interface AttemptDetailsState {
  attempt: StudentPaperAttemptDto | null;
  loading: boolean;
  error: string | null;
}
```

## UI/UX Requirements

### Design System Integration

#### Color Scheme
- **Primary**: Blue tones for headers and buttons
- **Success**: Green for correct answers and positive performance
- **Warning**: Yellow/orange for partial credit
- **Danger**: Red for incorrect answers
- **Neutral**: Gray for secondary information

#### Typography
- **Headers**: Inter font, semibold weights
- **Body**: Inter font, regular weights
- **Code/Technical**: Monospace for technical terms

#### Spacing & Layout
- **Container**: Max-width 6xl (72rem) with responsive margins
- **Card Padding**: 24px (1.5rem) on all sides
- **Element Spacing**: 16px (1rem) standard gap
- **Section Spacing**: 32px (2rem) between major sections

### Component Specifications

#### Attempt History Page Layout
```
┌─────────────────────────────────────┐
│ Breadcrumb Navigation                │
├─────────────────────────────────────┤
│ Page Header                         │
│ • "Your Previous Attempts"          │
│ • Paper name and context            │
├─────────────────────────────────────┤
│ Filter/Sort Controls (Future)       │
├─────────────────────────────────────┤
│ Attempt Cards Grid                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │Card #1  │ │Card #2  │ │Card #3  │ │
│ └─────────┘ └─────────┘ └─────────┘ │
│ ┌─────────┐ ┌─────────┐             │
│ │Card #4  │ │Card #5  │             │
│ └─────────┘ └─────────┘             │
├─────────────────────────────────────┤
│ Pagination (if needed)              │
└─────────────────────────────────────┘
```

#### Attempt Card Design
```
┌─────────────────────────────────────┐
│ [Attempt #6]    [Latest Badge]      │
│ [Status: SUBMITTED] [Performance: 85%] │
│ Completed: Jan 15, 2024 3:30 PM     │
│ Time: 5 minutes                     │
├─────────────────────────────────────┤
│ Overall Feedback Preview            │
│ "Excellent work on question 2.      │
│ Consider reviewing..."             │
├─────────────────────────────────────┤
│ [View Full Details →]               │
└─────────────────────────────────────┘
```

#### Attempt Details Page Layout
```
┌─────────────────────────────────────┐
│ Breadcrumb Navigation                │
├─────────────────────────────────────┤
│ Attempt Header                      │
│ • Attempt #6 - Review               │
│ • Score: 15/20 (75%)                │
│ • Time: 5 minutes                   │
│ • Completed: Jan 15, 2024           │
├─────────────────────────────────────┤
│ Overall AI Feedback                 │
│ [Collapsible section with full text]│
├─────────────────────────────────────┤
│ Questions & Answers                 │
│ ┌─────────────────────────────────┐ │
│ │ Question 1                      │ │
│ │ [Question text]                 │ │
│ │ ┌──────────┐ ┌──────────────┐ │ │
│ │ │Your Answer│ │Correct Answer│ │ │
│ │ │"Option B" │ │"Option A"   │ │ │
│ │ └──────────┘ └──────────────┘ │ │
│ │ Marks: 0/5                     │ │
│ │ AI Feedback: "..."             │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Question 2 [Similar layout]     │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Back to Attempt History]           │
└─────────────────────────────────────┘
```

### Interactive Elements

#### Buttons
- **Primary**: Blue background, white text, hover effects
- **Secondary**: Gray background, dark text, border
- **Interactive**: Hover elevation and shadow increase

#### Loading States
- Skeleton placeholders for content loading
- Spinner for async operations
- Progressive loading for large content

#### Hover Effects
- Cards: Slight elevation (transform: translateY(-2px))
- Buttons: Scale (1.02) and shadow increase
- Links: Color change to blue

### Performance Requirements

#### Loading Times
- **Attempt History**: < 1 second for 10 attempts
- **Attempt Details**: < 2 seconds for full breakdown
- **Image/Asset Loading**: < 3 seconds on 3G

#### Bundle Size
- **Initial Bundle**: < 200KB
- **Lazy-loaded Components**: < 50KB each
- **Total Feature Impact**: < 300KB

#### Runtime Performance
- **First Contentful Paint**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Frame Rate**: 60fps for smooth interactions

## Non-Functional Requirements

### Accessibility (WCAG 2.1 AA)
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Focus indicators on all interactive elements
- [ ] Semantic HTML structure

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Core functionality works without JavaScript

### Security
- [ ] JWT token validation on all API calls
- [ ] User authorization checks (403 for unauthorized attempts)
- [ ] XSS prevention through React's built-in protections
- [ ] Sensitive data handling according to privacy policies

### Scalability
- [ ] Support up to 100 attempts per paper
- [ ] Efficient rendering of large attempt lists
- [ ] Optimized API calls with proper caching
- [ ] Memory leak prevention in component lifecycle

### Maintainability
- [ ] TypeScript strict mode compliance
- [ ] ESLint rules satisfaction
- [ ] Component documentation with JSDoc
- [ ] Test coverage ≥ 80%
- [ ] Modular, reusable components

## Acceptance Criteria Summary

### Must Have (MVP)
- [ ] View attempt history summary
- [ ] View detailed attempt breakdown
- [ ] Navigate from paper details to attempts
- [ ] Display correct answers and AI feedback
- [ ] Handle authentication and authorization
- [ ] Responsive design for mobile/tablet
- [ ] Loading and error states

### Should Have (Enhanced UX)
- [ ] Performance analytics and trends
- [ ] Improved visual design and animations
- [ ] Keyboard navigation
- [ ] Accessibility features
- [ ] Search and filtering (future)

### Could Have (Future Enhancements)
- [ ] Comparison view between attempts
- [ ] Export attempt details as PDF
- [ ] Performance charts and graphs
- [ ] Social features (share achievements)
- [ ] Offline viewing capability

## Success Metrics

### User Engagement
- **Time on Page**: Students spend average 2+ minutes viewing attempts
- **Return Rate**: Students view attempts for 80%+ of their submissions
- **Feature Usage**: 70%+ of students use attempt details within first week

### Performance
- **Page Load Time**: < 2 seconds for attempt history
- **API Response Time**: < 500ms for attempt data
- **Error Rate**: < 1% of API calls fail
- **Mobile Performance**: Similar experience to desktop

### Learning Outcomes
- **Improvement Tracking**: Students can identify performance trends
- **Engagement**: Students spend more time reviewing feedback
- **Retention**: Students return to attempt details multiple times

This specification provides a comprehensive foundation for implementing the View Past Attempts feature with excellent user experience, performance, and maintainability.