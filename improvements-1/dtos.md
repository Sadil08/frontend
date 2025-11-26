DTOs Documentation - EduApp Backend API
This document provides comprehensive documentation for all Data Transfer Objects (DTOs) used in the EduApp backend API. Each DTO is explained with its structure, purpose, usage context, and TypeScript interface for frontend integration.

Table of Contents
Paper Bundle DTOs

PaperBundleSummaryDto
PaperBundleDetailDto
MyBundleDto
Paper DTOs

PaperSummaryDto
PaperDetailDto
PaperAttemptDto
PaperSubmissionDto
Question DTOs

QuestionDto
QuestionAttemptDto
Student Answer & Attempt DTOs

StudentAnswerDto
StudentPaperAttemptDto
DTO Inheritance Hierarchy
PaperBundleSummaryDto
    ↓ extends
PaperBundleDetailDto
PaperSummaryDto
    ↓ extends
PaperDetailDto
    ↓ extends
PaperAttemptDto
Paper Bundle DTOs
PaperBundleSummaryDto
Purpose: Represents basic information about a paper bundle for browsing/listing.

Used In:

GET /api/paper-bundles - Browse all available bundles (public)
GET /api/paper-bundles/{id} - View bundle details (inherits from this)
Context: Public browsing, bundle listing pages

Structure:

Field	Type	Nullable	Description
id	Long	No	Unique bundle identifier
name	String	No	Bundle name (e.g., "Math Bundle 2024")
description	String	Yes	Detailed description of bundle contents
price	BigDecimal	No	Bundle price in currency
type	PaperType	No	Type: PRACTICE, EXAM, MOCK
examType	String	Yes	Exam category: MIDTERM, FINAL, QUIZ
subjectId	Long	Yes	Reference to subject
lessonId	Long	Yes	Reference to specific lesson (optional)
isPastPaper	Boolean	No	Whether bundle contains past papers
TypeScript Interface:

interface PaperBundleSummaryDto {
  id: number;
  name: string;
  description: string | null;
  price: number;
  type: 'PRACTICE' | 'EXAM' | 'MOCK';
  examType: string | null;
  subjectId: number | null;
  lessonId: number | null;
  isPastPaper: boolean;
}
Example JSON:

{
  "id": 1,
  "name": "Math Bundle 2024",
  "description": "Complete collection of math papers",
  "price": 100.00,
  "type": "PRACTICE",
  "examType": "MIDTERM",
  "subjectId": 5,
  "lessonId": null,
  "isPastPaper": false
}
Frontend Usage:

Display in bundle catalog/browse page
Show price and basic info before purchase
Filter by type, examType, subject
PaperBundleDetailDto
Purpose: Extends 
PaperBundleSummaryDto
 with list of papers included in the bundle.

Used In:

GET /api/paper-bundles/{id} - View bundle details (requires purchase)
Context: After purchase, viewing bundle contents

Structure: Inherits all fields from 
PaperBundleSummaryDto
 plus:

Field	Type	Nullable	Description
papers	List	No	List of papers in this bundle
TypeScript Interface:

interface PaperBundleDetailDto extends PaperBundleSummaryDto {
  papers: PaperSummaryDto[];
}
Example JSON:

{
  "id": 1,
  "name": "Math Bundle 2024",
  "description": "Complete collection of math papers",
  "price": 100.00,
  "type": "PRACTICE",
  "examType": "MIDTERM",
  "subjectId": 5,
  "lessonId": null,
  "isPastPaper": false,
  "papers": [
    {
      "id": 101,
      "bundleId": 1,
      "name": "Algebra Basics",
      "description": "Test your algebra fundamentals",
      "type": "PRACTICE",
      "maxFreeAttempts": 3
    },
    {
      "id": 102,
      "bundleId": 1,
      "name": "Calculus Advanced",
      "description": "Advanced calculus problems",
      "type": "PRACTICE",
      "maxFreeAttempts": 2
    }
  ]
}
Frontend Usage:

Display after bundle purchase
Show list of available papers
Allow navigation to individual papers
Security: Only accessible if bundle is purchased
MyBundleDto
Purpose: Represents a purchased bundle with enriched metadata for student dashboard.

Used In:

GET /api/student-bundle-accesses/my-bundles - Get user's purchased bundles
Context: Student dashboard, "My Bundles" page

Structure:

Field	Type	Nullable	Description
accessId	Long	No	Unique access record ID
bundleId	Long	No	Reference to bundle
bundleName	String	No	Bundle name
bundleDescription	String	Yes	Bundle description
price	BigDecimal	No	Price paid
type	PaperType	No	Bundle type
examType	String	Yes	Exam category
isPastPaper	Boolean	No	Past paper flag
subjectName	String	Yes	Resolved subject name (not just ID)
lessonName	String	Yes	Resolved lesson name (not just ID)
purchasedAt	LocalDateTime	No	Purchase timestamp
paperCount	int	No	Number of papers in bundle
TypeScript Interface:

interface MyBundleDto {
  accessId: number;
  bundleId: number;
  bundleName: string;
  bundleDescription: string | null;
  price: number;
  type: 'PRACTICE' | 'EXAM' | 'MOCK';
  examType: string | null;
  isPastPaper: boolean;
  subjectName: string | null;
  lessonName: string | null;
  purchasedAt: string; // ISO 8601 datetime
  paperCount: number;
}
Example JSON:

{
  "accessId": 42,
  "bundleId": 1,
  "bundleName": "Math Bundle 2024",
  "bundleDescription": "Complete collection of math papers",
  "price": 100.00,
  "type": "PRACTICE",
  "examType": "MIDTERM",
  "isPastPaper": false,
  "subjectName": "Mathematics",
  "lessonName": null,
  "purchasedAt": "2025-11-25T10:30:00",
  "paperCount": 5
}
Frontend Usage:

Display on student dashboard
Show purchase history
Display resolved subject/lesson names (no need for additional lookups)
Show paper count for quick reference
Sort by purchasedAt to show recent purchases first
Paper DTOs
PaperSummaryDto
Purpose: Base DTO for paper information without questions.

Used In:

Nested in 
PaperBundleDetailDto
Base for 
PaperDetailDto
 and 
PaperAttemptDto
Context: Listing papers, showing paper metadata

Structure:

Field	Type	Nullable	Description
id	Long	No	Unique paper identifier
name	String	No	Paper name/title
description	String	Yes	Paper description
type	PaperType	No	PRACTICE, EXAM, MOCK
bundleId	Long	No	Parent bundle ID
maxFreeAttempts	Integer	Yes	Max free attempts allowed
TypeScript Interface:

interface PaperSummaryDto {
  id: number;
  name: string;
  description: string | null;
  type: 'PRACTICE' | 'EXAM' | 'MOCK';
  bundleId: number;
  maxFreeAttempts: number | null;
}
Example JSON:

{
  "id": 101,
  "bundleId": 1,
  "name": "Algebra Basics",
  "description": "Test your algebra fundamentals",
  "type": "PRACTICE",
  "maxFreeAttempts": 3
}
PaperDetailDto
Purpose: Extends 
PaperSummaryDto
 with complete question details including correct answers.

Used In:

Admin endpoints (not typically exposed to students)
Paper management/editing
Context: Admin panel, paper creation/editing

Structure: Inherits all fields from 
PaperSummaryDto
 plus:

Field	Type	Nullable	Description
questions	List	No	Complete questions with answers
TypeScript Interface:

interface PaperDetailDto extends PaperSummaryDto {
  questions: QuestionDto[];
}
Security Note: Contains correctAnswerText in questions - NOT for student use

PaperAttemptDto
Purpose: Extends 
PaperSummaryDto
 with questions for student attempts (NO correct answers).

Used In:

GET /api/papers/{id}/attempt - Start paper attempt
Context: Student attempting a paper

Structure: Inherits all fields from 
PaperSummaryDto
 plus:

Field	Type	Nullable	Description
questions	List	No	Questions WITHOUT correct answers
TypeScript Interface:

interface PaperAttemptDto extends PaperSummaryDto {
  questions: QuestionAttemptDto[];
}
Example JSON:

{
  "id": 101,
  "bundleId": 1,
  "name": "Algebra Basics",
  "description": "Test your algebra fundamentals",
  "type": "PRACTICE",
  "maxFreeAttempts": 3,
  "questions": [
    {
      "id": 201,
      "paperId": 101,
      "text": "What is 2+2?",
      "type": "MCQ",
      "marks": 5,
      "options": [
        {"id": 301, "text": "3", "isCorrect": false},
        {"id": 302, "text": "4", "isCorrect": false}
      ]
    }
  ]
}
Frontend Usage:

Display questions to student
Render answer inputs (MCQ, essay, etc.)
Track time taken
Collect answers for submission
Security: Questions do NOT include correctAnswerText or isCorrect flags

PaperSubmissionDto
Purpose: Submitted by frontend when student completes a paper.

Used In:

POST /api/papers/{id}/submit - Submit completed paper
Context: Student submitting answers

Structure:

Field	Type	Nullable	Description
answers	List	No	List of submitted answers
timeTakenMinutes	Integer	No	Total time taken in minutes
Nested DTO - StudentAnswerSubmissionDto:

Field	Type	Nullable	Description
questionId	Long	No	Question being answered
selectedOptionId	Long	Yes	Selected option (for MCQ)
answerText	String	Yes	Text answer (for essay/short answer)
TypeScript Interface:

interface PaperSubmissionDto {
  answers: StudentAnswerSubmissionDto[];
  timeTakenMinutes: number;
}
interface StudentAnswerSubmissionDto {
  questionId: number;
  selectedOptionId: number | null;
  answerText: string | null;
}
Example JSON:

{
  "timeTakenMinutes": 45,
  "answers": [
    {
      "questionId": 201,
      "selectedOptionId": 302,
      "answerText": "4"
    },
    {
      "questionId": 202,
      "selectedOptionId": null,
      "answerText": "The derivative of x² is 2x because..."
    }
  ]
}
Frontend Usage:

Collect all answers from form
Calculate time taken (end time - start time)
Submit to backend
Note: For MCQ, include both selectedOptionId AND answerText (text of selected option)
Question DTOs
QuestionDto
Purpose: Complete question details including correct answer (Admin use).

Used In:

Nested in 
PaperDetailDto
Admin endpoints
Context: Admin panel, paper management

Structure:

Field	Type	Nullable	Description
id	Long	No	Question ID
paperId	Long	No	Parent paper ID
text	String	No	Question text
type	QuestionType	No	MCQ, ESSAY, SHORT_ANSWER
correctAnswerText	String	Yes	Correct answer (for grading)
marks	Integer	No	Marks allocated
options	List	No	Answer options (for MCQ)
TypeScript Interface:

interface QuestionDto {
  id: number;
  paperId: number;
  text: string;
  type: 'MCQ' | 'ESSAY' | 'SHORT_ANSWER';
  correctAnswerText: string | null;
  marks: number;
  options: QuestionOptionDto[];
}
interface QuestionOptionDto {
  id: number;
  text: string;
  isCorrect: boolean;
}
Security: Contains correctAnswerText - Admin only

QuestionAttemptDto
Purpose: Question details for student attempts (NO correct answer).

Used In:

Nested in 
PaperAttemptDto
GET /api/papers/{id}/attempt
Context: Student attempting paper

Structure:

Field	Type	Nullable	Description
id	Long	No	Question ID
paperId	Long	No	Parent paper ID
text	String	No	Question text
type	QuestionType	No	MCQ, ESSAY, SHORT_ANSWER
marks	Integer	No	Marks allocated
options	List	No	Options WITHOUT isCorrect flag
TypeScript Interface:

interface QuestionAttemptDto {
  id: number;
  paperId: number;
  text: string;
  type: 'MCQ' | 'ESSAY' | 'SHORT_ANSWER';
  marks: number;
  options: QuestionOptionDto[];
}
interface QuestionOptionDto {
  id: number;
  text: string;
  // NOTE: isCorrect is NOT included for student attempts
}
Example JSON:

{
  "id": 201,
  "paperId": 101,
  "text": "What is the derivative of x²?",
  "type": "MCQ",
  "marks": 5,
  "options": [
    {"id": 401, "text": "x"},
    {"id": 402, "text": "2x"},
    {"id": 403, "text": "x³"}
  ]
}
Frontend Usage:

Render question text
Display options for MCQ
Show text area for ESSAY
Show input field for SHORT_ANSWER
Display marks available
Student Answer & Attempt DTOs
StudentAnswerDto
Purpose: Represents a student's answer with AI grading results.

Used In:

Nested in 
StudentPaperAttemptDto
POST /api/papers/{id}/submit response
GET /api/papers/attempts/{attemptId} response
Context: Viewing graded answers, results page

Structure:

Field	Type	Nullable	Description
id	Long	No	Answer record ID
attemptId	Long	No	Parent attempt ID
questionId	Long	No	Question answered
questionText	String	Yes	Question text (for display)
answerText	String	Yes	Student's text answer
selectedOptionId	Long	Yes	Selected option (MCQ)
submittedAt	LocalDateTime	No	Submission timestamp
marksAwarded	Integer	Yes	Marks given by AI (null until graded)
marksAvailable	Integer	No	Total marks for question
aiFeedback	String	Yes	AI-generated feedback (null until graded)
TypeScript Interface:

interface StudentAnswerDto {
  id: number;
  attemptId: number;
  questionId: number;
  questionText: string | null;
  answerText: string | null;
  selectedOptionId: number | null;
  submittedAt: string; // ISO 8601 datetime
  marksAwarded: number | null; // null until AI grades
  marksAvailable: number;
  aiFeedback: string | null; // null until AI grades
}
Example JSON (Before AI Grading):

{
  "id": 1501,
  "attemptId": 789,
  "questionId": 201,
  "questionText": "What is 2+2?",
  "answerText": "4",
  "selectedOptionId": 302,
  "submittedAt": "2025-11-25T14:45:00",
  "marksAwarded": null,
  "marksAvailable": 5,
  "aiFeedback": null
}
Example JSON (After AI Grading):

{
  "id": 1501,
  "attemptId": 789,
  "questionId": 201,
  "questionText": "What is 2+2?",
  "answerText": "4",
  "selectedOptionId": 302,
  "submittedAt": "2025-11-25T14:45:00",
  "marksAwarded": 5,
  "marksAvailable": 5,
  "aiFeedback": "Perfect! Correct answer."
}
Frontend Usage:

Display student's answer
Show marks awarded vs available
Display AI feedback
Calculate percentage: 
(marksAwarded / marksAvailable) * 100
Check for null: If marksAwarded or aiFeedback is null, show "Grading in progress..."
StudentPaperAttemptDto
Purpose: Complete attempt record with all answers and AI analysis.

Used In:

POST /api/papers/{id}/submit - Response after submission
GET /api/papers/attempts/{attemptId} - Retrieve graded results
Context: Submission confirmation, results page

Structure:

Field	Type	Nullable	Description
id	Long	No	Attempt record ID
studentId	Long	No	Student who attempted
paperId	Long	No	Paper attempted
attemptNumber	Integer	No	Attempt number (1, 2, 3...)
status	String	No	SUBMITTED, GRADED, etc.
startedAt	LocalDateTime	No	When attempt started
completedAt	LocalDateTime	No	When submitted
timeTakenMinutes	Integer	No	Time taken
answers	List	No	All submitted answers
overallFeedback	String	Yes	AI overall feedback (null until graded)
totalMarks	Integer	Yes	Total marks awarded (null until graded)
TypeScript Interface:

interface StudentPaperAttemptDto {
  id: number;
  studentId: number;
  paperId: number;
  attemptNumber: number;
  status: string;
  startedAt: string; // ISO 8601 datetime
  completedAt: string; // ISO 8601 datetime
  timeTakenMinutes: number;
  answers: StudentAnswerDto[];
  overallFeedback: string | null; // null until AI grades
  totalMarks: number | null; // null until AI grades
}
Example JSON (Immediately After Submission):

{
  "id": 789,
  "studentId": 42,
  "paperId": 101,
  "attemptNumber": 1,
  "status": "SUBMITTED",
  "startedAt": "2025-11-25T14:00:00",
  "completedAt": "2025-11-25T14:45:00",
  "timeTakenMinutes": 45,
  "overallFeedback": null,
  "totalMarks": null,
  "answers": [
    {
      "id": 1501,
      "attemptId": 789,
      "questionId": 201,
      "questionText": "What is 2+2?",
      "answerText": "4",
      "selectedOptionId": 302,
      "submittedAt": "2025-11-25T14:45:00",
      "marksAwarded": null,
      "marksAvailable": 5,
      "aiFeedback": null
    }
  ]
}
Example JSON (After AI Grading):

{
  "id": 789,
  "studentId": 42,
  "paperId": 101,
  "attemptNumber": 1,
  "status": "SUBMITTED",
  "startedAt": "2025-11-25T14:00:00",
  "completedAt": "2025-11-25T14:45:00",
  "timeTakenMinutes": 45,
  "overallFeedback": "Good work! You demonstrated solid understanding.",
  "totalMarks": 14,
  "answers": [
    {
      "id": 1501,
      "attemptId": 789,
      "questionId": 201,
      "questionText": "What is 2+2?",
      "answerText": "4",
      "selectedOptionId": 302,
      "submittedAt": "2025-11-25T14:45:00",
      "marksAwarded": 5,
      "marksAvailable": 5,
      "aiFeedback": "Perfect! Correct answer."
    }
  ]
}
Frontend Usage:

After Submission:

Show attempt ID and confirmation
Display "Grading in progress..." if totalMarks is null
Store attempt ID for later retrieval
Polling for Results:

Call GET /api/papers/attempts/{attemptId} every 5-10 seconds
Check if totalMarks is not null
Once graded, display results
Results Display:

Show overall feedback and total marks
Display each answer with marks and feedback
Calculate percentage
Show time taken
Display attempt number
Common Patterns & Best Practices
1. Null Handling
Many fields can be null, especially before AI grading:

marksAwarded - null until AI grades
aiFeedback - null until AI grades
overallFeedback - null until AI grades
totalMarks - null until AI grades
Frontend Pattern:

if (attempt.totalMarks === null) {
  return <div>Grading in progress...</div>;
}
2. DateTime Handling
All datetime fields are in ISO 8601 format: 2025-11-25T14:45:00

Frontend Pattern:

const submittedDate = new Date(answer.submittedAt);
const formattedDate = submittedDate.toLocaleString();
3. Enum Values
PaperType: PRACTICE, EXAM, MOCK
QuestionType: MCQ, ESSAY, SHORT_ANSWER
AttemptStatus: SUBMITTED, GRADED, IN_PROGRESS

4. Security Considerations
QuestionDto
 contains correctAnswerText - Admin only
QuestionAttemptDto
 does NOT contain correct answers - Student safe
PaperBundleDetailDto
 requires purchase verification
StudentPaperAttemptDto
 includes security check (student can only access own attempts)
5. Inheritance Usage
When working with inherited DTOs, remember:

PaperBundleDetailDto
 has all fields from 
PaperBundleSummaryDto
 + papers
PaperDetailDto
 has all fields from 
PaperSummaryDto
 + questions
PaperAttemptDto
 has all fields from 
PaperSummaryDto
 + questions
API Endpoint to DTO Mapping
Endpoint	Method	Request DTO	Response DTO
/api/paper-bundles	GET	-	List
/api/paper-bundles/{id}	GET	-	PaperBundleDetailDto
/api/paper-bundles/{id}/purchase	POST	-	-
/api/student-bundle-accesses/my-bundles	GET	-	List
/api/papers/{id}/attempt	GET	-	PaperAttemptDto
/api/papers/{id}/submit	POST	PaperSubmissionDto	StudentPaperAttemptDto
/api/papers/attempts/{attemptId}	GET	-	StudentPaperAttemptDto
Complete TypeScript Type Definitions
// Enums
type PaperType = 'PRACTICE' | 'EXAM' | 'MOCK';
type QuestionType = 'MCQ' | 'ESSAY' | 'SHORT_ANSWER';
type AttemptStatus = 'SUBMITTED' | 'GRADED' | 'IN_PROGRESS';
// Paper Bundle DTOs
interface PaperBundleSummaryDto {
  id: number;
  name: string;
  description: string | null;
  price: number;
  type: PaperType;
  examType: string | null;
  subjectId: number | null;
  lessonId: number | null;
  isPastPaper: boolean;
}
interface PaperBundleDetailDto extends PaperBundleSummaryDto {
  papers: PaperSummaryDto[];
}
interface MyBundleDto {
  accessId: number;
  bundleId: number;
  bundleName: string;
  bundleDescription: string | null;
  price: number;
  type: PaperType;
  examType: string | null;
  isPastPaper: boolean;
  subjectName: string | null;
  lessonName: string | null;
  purchasedAt: string;
  paperCount: number;
}
// Paper DTOs
interface PaperSummaryDto {
  id: number;
  name: string;
  description: string | null;
  type: PaperType;
  bundleId: number;
  maxFreeAttempts: number | null;
}
interface PaperDetailDto extends PaperSummaryDto {
  questions: QuestionDto[];
}
interface PaperAttemptDto extends PaperSummaryDto {
  questions: QuestionAttemptDto[];
}
interface PaperSubmissionDto {
  answers: StudentAnswerSubmissionDto[];
  timeTakenMinutes: number;
}
interface StudentAnswerSubmissionDto {
  questionId: number;
  selectedOptionId: number | null;
  answerText: string | null;
}
// Question DTOs
interface QuestionDto {
  id: number;
  paperId: number;
  text: string;
  type: QuestionType;
  correctAnswerText: string | null;
  marks: number;
  options: QuestionOptionDto[];
}
interface QuestionAttemptDto {
  id: number;
  paperId: number;
  text: string;
  type: QuestionType;
  marks: number;
  options: QuestionOptionDto[];
}
interface QuestionOptionDto {
  id: number;
  text: string;
  isCorrect?: boolean; // Only in QuestionDto (admin), not in QuestionAttemptDto
}
// Student Answer & Attempt DTOs
interface StudentAnswerDto {
  id: number;
  attemptId: number;
  questionId: number;
  questionText: string | null;
  answerText: string | null;
  selectedOptionId: number | null;
  submittedAt: string;
  marksAwarded: number | null;
  marksAvailable: number;
  aiFeedback: string | null;
}
interface StudentPaperAttemptDto {
  id: number;
  studentId: number;
  paperId: number;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  completedAt: string;
  timeTakenMinutes: number;
  answers: StudentAnswerDto[];
  overallFeedback: string | null;
  totalMarks: number | null;
}
Validation Rules
PaperSubmissionDto
timeTakenMinutes must be > 0
answers must not be empty
Each answer must have questionId
For MCQ: selectedOptionId is required
For ESSAY/SHORT_ANSWER: answerText is required
Frontend Validation Example
function validateSubmission(submission: PaperSubmissionDto): boolean {
  if (submission.timeTakenMinutes <= 0) return false;
  if (submission.answers.length === 0) return false;
  
  for (const answer of submission.answers) {
    if (!answer.questionId) return false;
    // Add type-specific validation
  }
  
  return true;
}