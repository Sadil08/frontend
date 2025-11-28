# View Past Attempts Feature - Constitution

## Clean Architecture & Design Principles

### Single Responsibility Principle (SRP)
- **AttemptHistory component**: Only handles display of attempt summary list
- **AttemptDetails component**: Only handles detailed question-by-question view  
- **AttemptService**: Only handles API communication for attempts
- **AttemptTypes**: Only defines TypeScript interfaces for attempt data
- **AttemptHooks**: Only handles state management and data fetching

### Open/Closed Principle (OCP)
- Components should be extensible through props, not modification
- Use composition patterns for common attempt card layouts
- Support different attempt display modes via configuration

### Liskov Substitution Principle (LSP)
- All attempt components should be interchangeable as children in parent containers
- Type definitions should allow replacement with more specific implementations

### Interface Segregation Principle (ISP)
- Create focused interfaces:
  - `AttemptSummaryProps`: Basic attempt card data
  - `AttemptDetailsProps`: Full attempt with answers and feedback
  - `AttemptServiceInterface`: Minimal API contract

### Dependency Inversion Principle (DIP)
- High-level components depend on abstractions, not concrete implementations
- Use abstract service interfaces for better testability
- Inject attempt services via props or context

## Technical Architecture

### Component Structure
```
/src/components/attempts/
├── AttemptHistory.tsx          # Summary list container
├── AttemptCard.tsx             # Individual attempt summary card  
├── AttemptDetails.tsx          # Full details container
├── AttemptQuestionCard.tsx     # Question-by-question breakdown
└── index.ts                    # Clean exports
```

### Service Layer
```
/src/services/
├── attemptService.ts           # API calls for attempts
└── types/
    └── attemptTypes.ts         # TypeScript interfaces
```

### Hook Pattern
```
/src/hooks/
├── useAttemptHistory.ts        # Fetch and manage attempt history
└── useAttemptDetails.ts        # Fetch and manage detailed attempt
```

### Page Integration
```
/src/app/papers/[id]/
├── past-attempts/              # New dedicated attempts view
│   └── page.tsx                # Attempt history page
└── attempts/[attemptId]/
    └── page.tsx                # Detailed attempt view
```

## Code Standards & Style Guidelines

### Version Consistency
- **Next.js**: 14.2.4 (as specified)
- **TypeScript**: 5.x (as specified)  
- **Ant Design**: 5.22.4 (as specified)
- **Tailwind CSS**: 3.4.18 (as specified)
- **Axios**: 1.7.9 (as specified)

### TypeScript Guidelines
```typescript
// Use specific interfaces for props
interface AttemptHistoryProps {
    attempts: StudentPaperAttemptDto[];
    paperId: number;
    loading?: boolean;
    onAttemptSelect?: (attemptId: number) => void;
}

// Prefer const over let
const AttemptHistory: React.FC<AttemptHistoryProps> = ({ attempts, paperId, loading = false, onAttemptSelect }) => {
    // Component logic
};
```

### Styling Standards

#### Tailwind CSS Classes
- Use consistent spacing scale: `space-y-4`, `gap-4`, `p-6`
- Apply card styling: `card-base`, `card-interactive`
- Use utility classes: `animate-slide-up`, `hover:shadow-lg`

#### Ant Design Integration
- Use Ant Design icons: `@ant-design/icons`
- Leverage Ant Design components: `Card`, `Tag`, `Button`, `Spin`, `Empty`
- Custom tab styling: `custom-tabs` class
- Consistent color scheme matching existing design

#### CSS Custom Properties
Follow established design system:
```css
/* Primary Colors */
--color-primary-50: #eff6ff;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;

/* Success Colors */  
--color-success-50: #f0fdf4;
--color-success-500: #22c55e;

/* Consistent spacing */
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
```

### Component Patterns

#### Loading States
```typescript
if (loading) {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-32 w-full rounded-lg" />
            ))}
        </div>
    );
}
```

#### Empty States
```typescript
if (!attempts || attempts.length === 0) {
    return (
        <Card className="card-base">
            <Empty
                description="No attempts yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
                <button onClick={handleStartAttempt} className="btn-primary mt-4">
                    Start Your First Attempt
                </button>
            </Empty>
        </Card>
    );
}
```

#### Error Handling
```typescript
try {
    const data = await attemptService.getAttemptHistory(paperId);
    setAttempts(data);
} catch (error: any) {
    console.error('Error fetching attempt history:', error);
    message.error('Failed to load attempt history');
}
```

### API Integration Standards

#### Service Pattern
```typescript
export const attemptService = {
    getAttemptHistory: async (paperId: number): Promise<StudentPaperAttemptDto[]> => {
        const response = await apiClient.get<StudentPaperAttemptDto[]>(
            `/api/student-paper-attempts/paper/${paperId}/history`
        );
        return response.data;
    },

    getAttemptDetails: async (attemptId: number): Promise<StudentPaperAttemptDto> => {
        const response = await apiClient.get<StudentPaperAttemptDto>(
            `/api/papers/attempts/${attemptId}`
        );
        return response.data;
    }
};
```

#### Authentication
- Use existing JWT token from `localStorage`
- Leverage existing `apiClient` interceptors for Authorization header
- Handle 401 errors via existing interceptor

#### Error Responses
- 401 Unauthorized: Redirect to login (handled by interceptor)
- 403 Forbidden: Show "Access Denied" message
- 404 Not Found: Show "Attempt Not Found" message
- 500 Server Error: Show generic error message

### Performance Guidelines

#### React Optimization
- Use `React.memo` for expensive components
- Implement `useCallback` for event handlers
- Use `useMemo` for expensive calculations
- Lazy load attempt details component

#### Bundle Optimization
- Code split attempt details into separate chunks
- Use dynamic imports for large components
- Optimize images and assets

### Accessibility Standards

#### WCAG 2.1 AA Compliance
- Proper heading hierarchy: `h1` → `h2` → `h3`
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast ratios meeting AA standards
- Screen reader compatible

#### Semantic HTML
```html
<!-- Good -->
<section aria-labelledby="attempt-history-heading">
    <h2 id="attempt-history-heading">Your Previous Attempts</h2>
    <div role="list">
        <div role="listitem">
            <button aria-describedby="attempt-1-description">
                Attempt #1
            </button>
            <div id="attempt-1-description">
                Score: 85%, Completed: Jan 15, 2024
            </div>
        </div>
    </div>
</section>
```

### Security Considerations

#### Data Privacy
- Never log sensitive attempt data in production
- Sanitize user input in essay answers
- Validate all data before display

#### XSS Prevention
- Use React's built-in XSS protection
- Avoid `dangerouslySetInnerHTML`
- Sanitize any external content

### Testing Standards

#### Component Testing
- Unit tests for all components
- Integration tests for user flows
- Visual regression tests for UI consistency
- Accessibility testing with tools like axe-core

#### Service Testing  
- Mock API responses
- Test error handling paths
- Verify authentication flow
- Test loading and error states

### Documentation Standards

#### Code Comments
- JSDoc for public APIs
- Inline comments for complex logic
- TypeScript type documentation
- Component prop documentation

#### README Updates
- Update feature documentation
- Include usage examples
- Document API endpoints
- Add troubleshooting guide

## UI/UX Design Principles

### Visual Hierarchy
- Clear attempt numbers with visual emphasis
- Score/marks prominently displayed
- Status indicators with consistent colors
- Progress indicators for time/performance

### Interaction Design
- Hover effects on interactive elements
- Smooth transitions and animations
- Loading states for all async operations
- Clear feedback for user actions

### Information Architecture
- Logical grouping of attempt information
- Progressive disclosure of details
- Quick access to most recent attempts
- Clear navigation between summary and details

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop enhancement
- Touch-friendly interface elements

## Quality Gates

### Before Merging
- [ ] All TypeScript types compile without errors
- [ ] ESLint rules pass with no warnings
- [ ] Components render correctly in development
- [ ] API integration works with real backend
- [ ] Responsive design tested across devices
- [ ] Accessibility standards met
- [ ] Performance benchmarks acceptable
- [ ] Security review completed
- [ ] Documentation updated

### Deployment Checklist
- [ ] Environment variables configured
- [ ] API endpoints accessible
- [ ] Authentication flow tested
- [ ] Error handling verified
- [ ] Loading states implemented
- [ ] Edge cases handled
- [ ] Performance optimized
- [ ] Analytics tracking added (if applicable)

This constitution ensures consistent, maintainable, and high-quality implementation of the View Past Attempts feature while adhering to modern React development best practices and the existing codebase patterns.