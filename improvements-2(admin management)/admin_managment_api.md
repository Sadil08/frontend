Admin API Documentation
Version: 1.0 | Last Updated: 2025-11-26

Complete API reference for EduApp Admin Management System. All endpoints require admin authentication.

Table of Contents
Authentication
Bundle Management
Paper Management
User Management
Data Models
Error Handling
Implementation Guide
Authentication
Required Headers
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
Role Requirement
All endpoints require ADMIN role
Invalid role returns 403 Forbidden
Missing/invalid token returns 401 Unauthorized
Bundle Management (8 Endpoints)
1. Get System Statistics
GET /api/admin/bundles/stats
Response:

{
  "totalBundles": 15,
  "totalPapers": 87,
  "totalQuestions": 1205,
  "totalUsers": 523,
  "totalAttempts": 2145,
  "totalRevenue": 12500.00
}
2. Get All Bundles
GET /api/admin/bundles
Response:

[
  {
    "id": 1,
    "name": "Math Bundle 2024",
    "description": "Complete math papers",
    "price": 100.00,
    "type": "PRACTICE",
    "examType": "MIDTERM",
    "subjectId": 5,
    "lessonId": null,
    "isPastPaper": false,
    "createdAt": "2024-01-15T10:00:00",
    "updatedAt": "2024-11-20T15:30:00",
    "createdBy": 1,
    "stats": {
      "bundleId": 1,
      "bundleName": "Math Bundle 2024",
      "totalPapers": 8,
      "totalQuestions": 120,
      "totalStudentsWithAccess": 45,
      "totalAttempts": 320
    }
  }
]
3. Get Bundle Statistics
GET /api/admin/bundles/{id}
Response:

{
  "bundleId": 1,
  "bundleName": "Math Bundle 2024",
  "totalPapers": 8,
  "totalQuestions": 120,
  "totalStudentsWithAccess": 45,
  "totalAttempts": 320
}
4. Create Bundle
POST /api/admin/bundles
Request:

{
  "name": "Physics Bundle 2025",
  "description": "Complete physics papers",
  "price": 150.00,
  "type": "EXAM",
  "examType": "FINAL",
  "isPastPaper": true
}
Response: Bundle object with ID

5. Update Bundle
PUT /api/admin/bundles/{id}
Request: Same as create

Response: Updated bundle object

6. Delete Bundle
DELETE /api/admin/bundles/{id}
Response: 204 No Content

7. Add Paper to Bundle
POST /api/admin/bundles/{bundleId}/papers/{paperId}
Response: 200 OK

8. Remove Paper from Bundle
DELETE /api/admin/bundles/{bundleId}/papers/{paperId}
Response: 204 No Content

Paper Management (8 Endpoints)
9. Get All Papers
GET /api/admin/papers
Response:

[
  {
    "id": 101,
    "name": "Algebra Fundamentals",
    "description": "Basic algebra test",
    "type": "PRACTICE",
    "bundleId": 1,
    "maxFreeAttempts": 3,
    "createdAt": "2024-02-10T09:00:00",
    "updatedAt": "2024-11-15T14:20:00",
    "createdBy": 1,
    "totalAttempts": 85,
    "averageScore": 72.5,
    "questions": []
  }
]
10. Get Paper Details
GET /api/admin/papers/{id}
Response: Paper with full questions array including correct answers

11. Create Paper
POST /api/admin/papers
Request:

{
  "name": "Calculus Advanced",
  "description": "Advanced calculus test",
  "type": "EXAM",
  "maxFreeAttempts": 2
}
Response: Created paper object

12. Update Paper
PUT /api/admin/papers/{id}
Request: Same as create

Response: Updated paper

13. Delete Paper
DELETE /api/admin/papers/{id}
Response: 204 No Content

Note: Cascades to delete all questions

14. Add Question
POST /api/admin/papers/{id}/questions
Request:

{
  "text": "What is the derivative of x²?",
  "type": "MCQ",
  "correctAnswerText": "2x",
  "marks": 5,
  "options": [
    {"text": "x", "isCorrect": false},
    {"text": "2x", "isCorrect": true},
    {"text": "x³", "isCorrect": false}
  ]
}
Response: Created question object

15. Update Question
PUT /api/admin/papers/{paperId}/questions/{questionId}
Request: Same as create question

Response: Updated question

16. Delete Question
DELETE /api/admin/papers/{paperId}/questions/{questionId}
Response: 204 No Content

User Management (7 Endpoints)
17. Get All Users
GET /api/admin/users
Response:

[
  {
    "id": 42,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "createdAt": "2024-01-10T12:00:00",
    "totalBundlesPurchased": 3,
    "totalAttempts": 45
  }
]
18. Get User Details
GET /api/admin/users/{id}
Response: Single user object

19. Get User's Bundles
GET /api/admin/users/{id}/bundles
Response:

[
  {
    "accessId": 123,
    "bundleId": 1,
    "bundleName": "Math Bundle 2024",
    "purchasedAt": "2024-03-15T10:30:00",
    "grantedByAdmin": false,
    "grantedBy": null,
    "grantReason": null
  },
  {
    "accessId": 124,
    "bundleId": 2,
    "bundleName": "Physics Bundle",
    "purchasedAt": "2024-10-01T14:00:00",
    "grantedByAdmin": true,
    "grantedBy": 1,
    "grantReason": "Scholarship student"
  }
]
20. Grant Bundle Access
POST /api/admin/users/{userId}/bundles
Request:

{
  "userId": 42,
  "bundleId": 3,
  "reason": "Scholarship program - top performer"
}
Response: Created access record

21. Revoke Bundle Access
DELETE /api/admin/users/{userId}/bundles/{bundleId}
Response: 204 No Content

22. Get User's Attempts
GET /api/admin/users/{id}/attempts
Response:

[
  {
    "userId": 42,
    "paperId": 101,
    "paperName": "Algebra Fundamentals",
    "attemptsMade": 2,
    "maxFreeAttempts": 3,
    "remainingAttempts": 1
  }
]
23. Update Attempt Limit
PUT /api/admin/users/{userId}/papers/{paperId}/attempts
Request:

{
  "userId": 42,
  "paperId": 101,
  "maxFreeAttempts": 5
}
Response: 200 OK

Note: Currently updates global limit for all users on this paper

Data Models
TypeScript Interfaces
// System Statistics
interface SystemStatsDto {
  totalBundles: number;
  totalPapers: number;
  totalQuestions: number;
  totalUsers: number;
  totalAttempts: number;
  totalRevenue: number;
}
// Bundle Models
interface BundleStatsDto {
  bundleId: number;
  bundleName: string;
  totalPapers: number;
  totalQuestions: number;
  totalStudentsWithAccess: number;
  totalAttempts: number;
}
interface AdminBundleDto {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'PRACTICE' | 'EXAM';
  examType: string;
  subjectId: number | null;
  lessonId: number | null;
  isPastPaper: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  stats: BundleStatsDto;
}
// Paper Models
interface AdminPaperDto {
  id: number;
  name: string;
  description: string;
  type: 'PRACTICE' | 'EXAM';
  bundleId: number | null;
  maxFreeAttempts: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  totalAttempts: number;
  averageScore: number;
  questions: QuestionDto[];
}
interface QuestionDto {
  id: number;
  paperId: number;
  text: string;
  type: 'MCQ' | 'ESSAY' | 'SHORT_ANSWER';
  correctAnswerText: string;
  marks: number;
  options: QuestionOptionDto[];
}
interface QuestionOptionDto {
  id?: number;
  text: string;
  isCorrect: boolean;
}
// User Models
interface AdminUserDto {
  id: number;
  username: string;
  email: string;
  role: string; // "STUDENT" | "ADMIN"
  createdAt: string;
  totalBundlesPurchased: number;
  totalAttempts: number;
}
interface UserBundleAccessDto {
  accessId: number;
  bundleId: number;
  bundleName: string;
  purchasedAt: string;
  grantedByAdmin: boolean;
  grantedBy: number | null;
  grantReason: string | null;
}
interface UserAttemptInfoDto {
  userId: number;
  paperId: number;
  paperName: string;
  attemptsMade: number;
  maxFreeAttempts: number;
  remainingAttempts: number; // Calculated: max - made
}
// Request DTOs
interface PaperBundleDto {
  name: string;
  description: string;
  price: number;
  type: 'PRACTICE' | 'EXAM';
  examType: string;
  isPastPaper: boolean;
}
interface PaperDto {
  name: string;
  description: string;
  type: 'PRACTICE' | 'EXAM';
  maxFreeAttempts: number;
}
interface QuestionCreateDto {
  text: string;
  type: 'MCQ' | 'ESSAY' | 'SHORT_ANSWER';
  correctAnswerText: string;
  marks: number;
  options: QuestionOptionDto[];
}
interface GrantBundleAccessDto {
  userId: number;
  bundleId: number;
  reason: string;
}
interface UpdateAttemptLimitDto {
  userId: number;
  paperId: number;
  maxFreeAttempts: number;
}
Error Handling
Status Codes
Code	Meaning	When
200	OK	Successful GET/PUT
201	Created	Successful POST
204	No Content	Successful DELETE
400	Bad Request	Invalid data/already exists
401	Unauthorized	Missing/invalid token
403	Forbidden	Not admin role
404	Not Found	Resource doesn't exist
500	Server Error	Internal error
Error Response Format
{
  status: number;
  error: string;
  message?: string;
}
Handling Errors
const handleApiError = (response: Response) => {
  switch (response.status) {
    case 400:
      throw new Error('Invalid request data');
    case 403:
      throw new Error('Admin access required');
    case 404:
      throw new Error('Resource not found');
    default:
      throw new Error('An error occurred');
  }
};
Implementation Guide
API Client Setup
class AdminApiClient {
  private baseUrl = '/api/admin';
  private token: string;
  constructor(token: string) {
    this.token = token;
  }
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    if (response.status === 204) {
      return null as T;
    }
    return response.json();
  }
  // Bundle Management
  async getSystemStats(): Promise<SystemStatsDto> {
    return this.request('/bundles/stats');
  }
  async getAllBundles(): Promise<AdminBundleDto[]> {
    return this.request('/bundles');
  }
  async createBundle(data: PaperBundleDto): Promise<any> {
    return this.request('/bundles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async deleteBundle(id: number): Promise<void> {
    return this.request(`/bundles/${id}`, { method: 'DELETE' });
  }
  // Paper Management
  async getAllPapers(): Promise<AdminPaperDto[]> {
    return this.request('/papers');
  }
  async createPaper(data: PaperDto): Promise<any> {
    return this.request('/papers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async addQuestion(paperId: number, data: QuestionCreateDto): Promise<any> {
    return this.request(`/papers/${paperId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  // User Management
  async getAllUsers(): Promise<AdminUserDto[]> {
    return this.request('/users');
  }
  async getUserBundles(userId: number): Promise<UserBundleAccessDto[]> {
    return this.request(`/users/${userId}/bundles`);
  }
  async grantBundleAccess(userId: number, data: GrantBundleAccessDto): Promise<any> {
    return this.request(`/users/${userId}/bundles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
// Usage
const adminApi = new AdminApiClient(authToken);
const stats = await adminApi.getSystemStats();
React Hook Example
import { useQuery, useMutation } from '@tanstack/react-query';
export const useSystemStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getSystemStats(),
  });
};
export const useCreateBundle = () => {
  return useMutation({
    mutationFn: (data: PaperBundleDto) => adminApi.createBundle(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'bundles']);
    },
  });
};
Form Validation Example
import { z } from 'zod';
const bundleSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  type: z.enum(['PRACTICE', 'EXAM']),
  examType: z.string(),
  isPastPaper: z.boolean(),
});
type BundleFormData = z.infer<typeof bundleSchema>;
Security Notes
✅ All endpoints protected with @PreAuthorize("hasRole('ADMIN')")
✅ JWT token required in Authorization header
✅ Audit trail for admin-granted access
✅ Role verification on every request
⚠️ Store tokens securely (httpOnly cookies recommended)
⚠️ Implement token refresh mechanism
⚠️ Log all admin actions for audit
Quick Start Checklist
 Obtain admin JWT token
 Set up API client with token
 Implement error handling
 Create TypeScript interfaces
 Build dashboard with system stats
 Implement bundle management UI
 Implement paper/question editor
 Implement user management UI
 Test all CRUD operations
 Add loading states
 Add success/error notifications