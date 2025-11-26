Paper Submission Flow - Complete Explanation
This document provides a comprehensive explanation of how the paper submission system works in the EduApp backend, from the moment a student attempts a paper to when they retrieve their graded results with AI feedback.

Overview
The paper submission flow consists of 4 main stages:

Paper Attempt - Student requests paper questions
Paper Submission - Student submits answers
AI Analysis (Async) - AI grades answers and provides feedback
Results Retrieval - Student retrieves graded results
Stage 1: Paper Attempt
Endpoint
GET /api/papers/{paperId}/attempt
Authorization: Bearer {jwt_token}
Flow
Controller: PaperController.attemptPaper()

Extracts userId from JWT token
Calls PaperService.getPaperAttempt(paperId, userId)
Service: PaperService.getPaperAttempt()

Fetches 
Paper
 entity from database
Verifies student has purchased the parent PaperBundle via StudentBundleAccessRepository
If access denied → throws SecurityException (403 Forbidden)
If access granted → maps 
Paper
 to 
PaperAttemptDto
 using 
PaperMapper
Mapper: PaperMapper.toAttemptDto()

Maps paper details (id, name, description, type)
Maps questions using QuestionMapper.toAttemptDto()
Important: Does NOT include correct answers or marks
Response: Returns 
PaperAttemptDto
 with questions

Sample Request/Response
Request:

GET /api/papers/5/attempt
Authorization: Bearer eyJhbGc...
Response (200 OK):

{
  "id": 5,
  "bundleId": 2,
  "name": "Calculus Midterm",
  "description": "Test your calculus knowledge",
  "type": "PRACTICE",
  "maxFreeAttempts": 3,
  "questions": [
    {
      "id": 101,
      "paperId": 5,
      "text": "What is the derivative of x²?",
      "type": "MCQ",
      "marks": 5,
      "options": [
        {"id": 401, "text": "x"},
        {"id": 402, "text": "2x"},
        {"id": 403, "text": "x³"}
      ]
    },
    {
      "id": 102,
      "paperId": 5,
      "text": "Explain the chain rule",
      "type": "ESSAY",
      "marks": 10,
      "options": []
    }
  ]
}
Stage 2: Paper Submission
Endpoint
POST /api/papers/{paperId}/submit
Authorization: Bearer {jwt_token}
Content-Type: application/json
Flow
Controller: PaperController.submitPaper()

Extracts userId from JWT token
Receives 
PaperSubmissionDto
 with answers
Calls PaperService.submitPaperAttempt(paperId, userId, submission)
Service: PaperService.submitPaperAttempt()

Fetches 
Paper
 and User entities
Verifies bundle access (security check)
Creates 
StudentPaperAttempt
 entity:
Sets student, paper, timestamps
Calculates attempt number by counting existing attempts: 
countByStudentIdAndPaperId(userId, paperId) + 1
Sets status to SUBMITTED
Saves attempt to database
Creates 
StudentAnswer
 entities for each answer:
Links to attempt and question
Stores answer text and selected option (if MCQ)
Saves each answer to database
Returns saved 
StudentPaperAttempt
Controller (continued):

Triggers async AI analysis: aiAnalysisService.analyzeAttempt(savedAttempt)
Maps attempt to 
StudentPaperAttemptDto
 using 
StudentPaperAttemptMapper
Returns DTO to frontend
Mapper: StudentPaperAttemptMapper.toDto()

Maps attempt details (id, studentId, paperId, attemptNumber, status, timestamps)
Maps answers using StudentAnswerMapper.toDtoList()
Note: overallFeedback and totalMarks are null at this point (AI hasn't run yet)
Sample Request/Response
Request:

POST /api/papers/5/submit
Authorization: Bearer eyJhbGc...
Content-Type: application/json
{
  "timeTakenMinutes": 45,
  "answers": [
    {
      "questionId": 101,
      "selectedOptionId": 402,
      "answerText": "2x"
    },
    {
      "questionId": 102,
      "selectedOptionId": null,
      "answerText": "The chain rule states that if you have a composite function f(g(x)), the derivative is f'(g(x)) * g'(x)"
    }
  ]
}
Response (200 OK):

{
  "id": 789,
  "studentId": 42,
  "paperId": 5,
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
      "questionId": 101,
      "questionText": "What is the derivative of x²?",
      "answerText": "2x",
      "selectedOptionId": 402,
      "submittedAt": "2025-11-25T14:45:00",
      "marksAwarded": null,
      "marksAvailable": 5,
      "aiFeedback": null
    },
    {
      "id": 1502,
      "attemptId": 789,
      "questionId": 102,
      "questionText": "Explain the chain rule",
      "answerText": "The chain rule states that...",
      "selectedOptionId": null,
      "submittedAt": "2025-11-25T14:45:00",
      "marksAwarded": null,
      "marksAvailable": 10,
      "aiFeedback": null
    }
  ]
}
Stage 3: AI Analysis (Async)
Trigger
Automatically triggered after paper submission via @Async method

Flow
Service: AIAnalysisService.analyzeAttempt()

Runs in separate thread (async)
Builds prompt with questions, correct answers, and student answers
Calls Gemini AI API with prompt
Receives JSON response with marks and feedback
AI Response Processing:

Parses JSON response
Creates 
OverallPaperAnalysis
 entity:
Links to attempt
Stores totalMarks and overallFeedback
Saves to database
Updates each 
StudentAnswer
 entity:
Sets marksAwarded (from AI)
Sets aiFeedback (from AI)
Explicitly saves each answer using StudentAnswerRepository
Completion:

Logs success
Student can now retrieve results with AI feedback
AI Prompt Format
Analyze the following student paper attempt. Provide output in strict JSON format.
The JSON should be an object with a 'questions' array. Each item in the array should have:
'questionId' (integer), 'marksAwarded' (integer), and 'feedback' (string).
Also include a top-level 'overallFeedback' (string) and 'totalMarks' (integer).
For MCQs, give full marks if correct, 0 if incorrect. For others, grade based on the answer.
Paper: Calculus Midterm
Description: Test your calculus knowledge
Question ID: 101
Question: What is the derivative of x²?
Marks Available: 5
Correct Answer: 2x
Student Answer: 2x (Option: 2x)
Question ID: 102
Question: Explain the chain rule
Marks Available: 10
Correct Answer: The chain rule is used for composite functions...
Student Answer: The chain rule states that if you have a composite function f(g(x)), the derivative is f'(g(x)) * g'(x)
AI Response Format
{
  "overallFeedback": "Good understanding of basic calculus concepts. Excellent work on derivatives!",
  "totalMarks": 14,
  "questions": [
    {
      "questionId": 101,
      "marksAwarded": 5,
      "feedback": "Perfect! Correct answer."
    },
    {
      "questionId": 102,
      "marksAwarded": 9,
      "feedback": "Very good explanation. Could include an example for full marks."
    }
  ]
}
Stage 4: Results Retrieval
Endpoint
GET /api/papers/attempts/{attemptId}
Authorization: Bearer {jwt_token}
Flow
Controller: PaperController.getAttemptResults()

Extracts userId from JWT token
Calls PaperService.getAttemptResults(attemptId, userId)
Service: PaperService.getAttemptResults()

Fetches attempt using 
findByIdAndStudentId(attemptId, userId)
 (security check)
If not found or belongs to different user → throws SecurityException
Maps attempt to DTO using 
StudentPaperAttemptMapper
Fetches 
OverallPaperAnalysis
 using 
findByAttemptId(attemptId)
If analysis exists, sets overallFeedback and totalMarks on DTO
Returns complete DTO
Mapper: StudentPaperAttemptMapper.toDto()

Maps attempt with all answers
StudentAnswerMapper
 includes marksAwarded and aiFeedback for each answer
Response: Returns complete 
StudentPaperAttemptDto
 with AI analysis

Sample Request/Response
Request:

GET /api/papers/attempts/789
Authorization: Bearer eyJhbGc...
Response (200 OK):

{
  "id": 789,
  "studentId": 42,
  "paperId": 5,
  "attemptNumber": 1,
  "status": "SUBMITTED",
  "startedAt": "2025-11-25T14:00:00",
  "completedAt": "2025-11-25T14:45:00",
  "timeTakenMinutes": 45,
  "overallFeedback": "Good understanding of basic calculus concepts. Excellent work on derivatives!",
  "totalMarks": 14,
  "answers": [
    {
      "id": 1501,
      "attemptId": 789,
      "questionId": 101,
      "questionText": "What is the derivative of x²?",
      "answerText": "2x",
      "selectedOptionId": 402,
      "submittedAt": "2025-11-25T14:45:00",
      "marksAwarded": 5,
      "marksAvailable": 5,
      "aiFeedback": "Perfect! Correct answer."
    },
    {
      "id": 1502,
      "attemptId": 789,
      "questionId": 102,
      "questionText": "Explain the chain rule",
      "answerText": "The chain rule states that...",
      "selectedOptionId": null,
      "submittedAt": "2025-11-25T14:45:00",
      "marksAwarded": 9,
      "marksAvailable": 10,
      "aiFeedback": "Very good explanation. Could include an example for full marks."
    }
  ]
}
Entity Relationships
StudentPaperAttempt (1) ←→ (1) OverallPaperAnalysis
       ↓
       (1 to Many)
       ↓
StudentAnswer
       ↓
       (Many to 1)
       ↓
    Question
Key Entities
StudentPaperAttempt: Represents one attempt by a student on a paper

Links to: Student (User), Paper
Contains: attemptNumber, status, timestamps, timeTakenMinutes
StudentAnswer: Individual answer for one question in an attempt

Links to: StudentPaperAttempt, Question, QuestionOption (if MCQ)
Contains: answerText, marksAwarded, aiFeedback
OverallPaperAnalysis: AI-generated overall analysis for an attempt

Links to: StudentPaperAttempt (one-to-one)
Contains: totalMarks, overallFeedback
Security
Bundle Access: Students must purchase the parent bundle before attempting a paper
Attempt Ownership: Students can only retrieve their own attempts via 
findByIdAndStudentId()
JWT Authentication: All endpoints require valid JWT token with userId
Troubleshooting
Issue: AI analysis not appearing
Cause: Async method may still be running
Solution: Wait 5-10 seconds after submission, then call GET /api/papers/attempts/{attemptId}
Issue: 403 Forbidden on attempt
Cause: Student hasn't purchased the bundle
Solution: Purchase bundle first via POST /api/student-bundle-accesses
Issue: Attempt number always 1
Fixed: Now properly counts existing attempts using 
countByStudentIdAndPaperId()
Issue: Marks not saved after AI analysis
Fixed: Now explicitly saves each 
StudentAnswer
 using StudentAnswerRepository.save()