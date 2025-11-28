# Backend Code Enhancement Guide
## Per-Paper Leaderboard & Attempt History

This guide provides detailed templates and examples for adding comprehensive comments and logging to the backend implementation.

---

## 1. LeaderboardController.java

### Class-Level Documentation

```java
package com.eduapp.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.eduapp.backend.entity.StudentPaperAttempt;
import com.eduapp.backend.repository.StudentPaperAttemptRepository;
import com.eduapp.backend.security.JwtUtil;

import java.util.*;
import java.util.stream.Collectors;

/**
 * REST Controller for managing leaderboards.
 * 
 * <p>This controller provides endpoints for:
 * <ul>
 *   <li>Viewing per-paper leaderboards (showing best attempt per student)</li>
 *   <li>Opting in to leaderboards (students can choose to display their results)</li>
 * </ul>
 * 
 * <p><b>Leaderboard Logic:</b>
 * <ul>
 *   <li>Each paper has its own leaderboard (no cross-paper comparison)</li>
 *   <li>Only opted-in attempts are shown (privacy-conscious)</li>
 *   <li>Only the best attempt per student is displayed (prevents spam)</li>
 *   <li>Best attempt = Highest marks, then lowest time taken</li>
 *   <li>Sorted by marks (descending), then time (ascending)</li>
 * </ul>
 * 
 * @author EduApp Team
 * @version 1.0
 * @since 2025-11-28
 */
@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {
    
    // Logger for tracking leaderboard operations and debugging
    private static final Logger logger = LoggerFactory.getLogger(LeaderboardController.class);
    
    @Autowired
    private StudentPaperAttemptRepository attemptRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
```

### Get Leaderboard Endpoint

```java
    /**
     * Retrieves the leaderboard for a specific paper.
     * 
     * <p>This endpoint returns a ranked list of students who have opted in to display
     * their results on the leaderboard. For students with multiple attempts, only their
     * best attempt is shown.
     * 
     * <p><b>Best Attempt Selection Criteria:</b>
     * <ol>
     *   <li>Highest total marks</li>
     *   <li>If marks are equal, lowest time taken</li>
     * </ol>
     * 
     * <p><b>Response Format:</b>
     * <pre>
     * [
     *   {
     *     "studentName": "john_doe",
     *     "marks": 95,
     *     "timeTaken": 45
     *   }
     * ]
     * </pre>
     * 
     * @param paperId the ID of the paper to get the leaderboard for
     * @return ResponseEntity containing a list of leaderboard entries, sorted by rank
     */
    @GetMapping("/paper/{paperId}")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard(@PathVariable Long paperId) {
        logger.info("Fetching leaderboard for paper ID: {}", paperId);
        
        // Step 1: Fetch all opted-in attempts for this paper
        // Only students who have explicitly opted in will appear on the leaderboard
        // Attempts are initially ordered by time taken (ascending) for efficiency
        List<StudentPaperAttempt> attempts = attemptRepository
                .findByPaperIdAndOptedInTrueOrderByTimeTakenMinutesAsc(paperId);
        
        logger.debug("Found {} opted-in attempts for paper ID: {}", attempts.size(), paperId);
        
        // Step 2: Transform attempts into a simplified structure with calculated marks
        // We calculate total marks here to avoid repeated calculations later
        List<Map<String, Object>> allEntries = attempts.stream()
                .map(attempt -> {
                    // Calculate total marks by summing marks awarded for all answers
                    int totalMarks = attempt.getAnswers().stream()
                            .mapToInt(a -> a.getMarksAwarded() != null ? a.getMarksAwarded() : 0)
                            .sum();
                    
                    // Create a simplified entry with only the data needed for the leaderboard
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("studentId", attempt.getStudent().getId());
                    entry.put("studentName", attempt.getStudent().getUsername());
                    entry.put("marks", totalMarks);
                    entry.put("timeTaken", attempt.getTimeTakenMinutes() != null ? attempt.getTimeTakenMinutes() : 0);
                    
                    return entry;
                })
                .collect(Collectors.toList());
        
        logger.debug("Transformed {} attempts into leaderboard entries", allEntries.size());
        
        // Step 3: Group by student ID and select the best attempt for each student
        // This ensures each student appears only once on the leaderboard
        // 
        // Best attempt selection logic:
        // 1. If replacement has higher marks than existing, use replacement
        // 2. If marks are equal, use the attempt with lower time taken
        // 3. Otherwise, keep the existing entry
        Map<Long, Map<String, Object>> bestAttempts = allEntries.stream()
                .collect(Collectors.toMap(
                        entry -> (Long) entry.get("studentId"),  // Key: student ID
                        entry -> entry,                           // Value: the entry itself
                        (existing, replacement) -> {
                            // Merge function: called when a student has multiple attempts
                            int existingMarks = (int) existing.get("marks");
                            int replacementMarks = (int) replacement.get("marks");
                            
                            // Compare marks first (higher is better)
                            if (replacementMarks > existingMarks) {
                                logger.trace("Student {} - Replacement attempt has higher marks ({} > {})", 
                                           replacement.get("studentId"), replacementMarks, existingMarks);
                                return replacement;
                            } else if (replacementMarks == existingMarks) {
                                // If marks are equal, compare time (lower is better)
                                int existingTime = (int) existing.get("timeTaken");
                                int replacementTime = (int) replacement.get("timeTaken");
                                
                                if (replacementTime < existingTime) {
                                    logger.trace("Student {} - Replacement attempt has same marks but faster time ({} < {})", 
                                               replacement.get("studentId"), replacementTime, existingTime);
                                    return replacement;
                                }
                            }
                            
                            // Keep existing entry if it's better or equal
                            return existing;
                        }
                ));
        
        logger.debug("Filtered to {} unique students after selecting best attempts", bestAttempts.size());
        
        // Step 4: Convert back to list and sort by ranking criteria
        // Primary sort: Marks (descending - higher is better)
        // Secondary sort: Time (ascending - faster is better)
        List<Map<String, Object>> leaderboard = bestAttempts.values().stream()
                .sorted((a, b) -> {
                    // Compare marks (descending)
                    int marksCompare = Integer.compare((int) b.get("marks"), (int) a.get("marks"));
                    if (marksCompare != 0) {
                        return marksCompare;
                    }
                    // If marks are equal, compare time (ascending)
                    return Integer.compare((int) a.get("timeTaken"), (int) b.get("timeTaken"));
                })
                .collect(Collectors.toList());
        
        logger.info("Successfully generated leaderboard for paper ID: {} with {} entries", 
                   paperId, leaderboard.size());
        
        // Return the final sorted leaderboard
        return ResponseEntity.ok(leaderboard);
    }
```

### Opt-In Endpoint

```java
    /**
     * Allows a student to opt in to displaying their attempt on the leaderboard.
     * 
     * <p>Students must explicitly opt in to have their results shown on the leaderboard.
     * This endpoint verifies that the student owns the attempt before allowing opt-in.
     * 
     * <p><b>Security:</b>
     * <ul>
     *   <li>Requires JWT authentication</li>
     *   <li>Students can only opt in their own attempts</li>
     *   <li>Returns 403 Forbidden if attempting to opt in another user's attempt</li>
     *   <li>Returns 404 Not Found if attempt doesn't exist</li>
     * </ul>
     * 
     * @param request the opt-in request containing the attempt ID
     * @param authHeader the JWT token from the Authorization header
     * @return ResponseEntity with 200 OK if successful, 403 if unauthorized, 404 if not found
     */
    @PostMapping("/opt-in")
    public ResponseEntity<String> optIn(
            @RequestBody Map<String, Long> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        // Extract attempt ID from request body
        Long attemptId = request.get("attemptId");
        logger.info("Opt-in request received for attempt ID: {}", attemptId);
        
        // Extract user ID from JWT token
        // Token format: "Bearer <token>"
        String token = authHeader.substring(7);  // Remove "Bearer " prefix
        Long userId = jwtUtil.extractUserId(token);
        logger.debug("Opt-in requested by user ID: {}", userId);
        
        // Fetch the attempt from database
        Optional<StudentPaperAttempt> attemptOpt = attemptRepository.findById(attemptId);
        
        // Verify attempt exists
        if (attemptOpt.isEmpty()) {
            logger.warn("Opt-in failed: Attempt ID {} not found", attemptId);
            return ResponseEntity.notFound().build();
        }
        
        StudentPaperAttempt attempt = attemptOpt.get();
        
        // Security check: Verify the attempt belongs to the requesting user
        // This prevents students from opting in other students' attempts
        if (!attempt.getStudent().getId().equals(userId)) {
            logger.warn("Opt-in denied: User ID {} attempted to opt in attempt ID {} belonging to user ID {}", 
                       userId, attemptId, attempt.getStudent().getId());
            return ResponseEntity.status(403).body("You can only opt in your own attempts");
        }
        
        // Check if already opted in (optional optimization)
        if (attempt.isOptedIn()) {
            logger.info("Attempt ID {} is already opted in", attemptId);
            return ResponseEntity.ok("Already opted in");
        }
        
        // Set the opted-in flag and save
        attempt.setOptedIn(true);
        attemptRepository.save(attempt);
        
        logger.info("Successfully opted in attempt ID {} for user ID {} on paper ID {}", 
                   attemptId, userId, attempt.getPaper().getId());
        
        return ResponseEntity.ok("Successfully opted in to leaderboard");
    }
}
```

---

## 2. StudentPaperAttemptController.java

### Attempt History Endpoint

```java
    /**
     * Retrieves the attempt history for a specific paper by the authenticated student.
     * 
     * <p>This endpoint returns all attempts made by the current user for a specific paper,
     * ordered by start time with the most recent attempts first. This allows students to
     * track their progress and compare their performance across multiple attempts.
     * 
     * <p><b>Security:</b>
     * <ul>
     *   <li>Requires JWT authentication</li>
     *   <li>Students can only view their own attempt history</li>
     *   <li>User ID is extracted from the JWT token</li>
     * </ul>
     * 
     * <p><b>Response:</b> List of StudentPaperAttemptDto objects containing:
     * <ul>
     *   <li>Attempt metadata (ID, attempt number, status, timestamps)</li>
     *   <li>All submitted answers with AI feedback and marks</li>
     *   <li>Overall feedback and total marks</li>
     * </ul>
     * 
     * @param paperId the ID of the paper to get attempt history for
     * @param authHeader the JWT token from the Authorization header
     * @return ResponseEntity containing a list of attempts, ordered by start time (newest first)
     */
    @GetMapping("/paper/{paperId}/history")
    public ResponseEntity<List<StudentPaperAttemptDto>> getAttemptHistory(
            @PathVariable Long paperId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        logger.info("Attempt history requested for paper ID: {}", paperId);
        
        // Extract user ID from JWT token
        // Token format: "Bearer <token>"
        String token = authHeader.substring(7);  // Remove "Bearer " prefix
        Long userId = jwtUtil.extractUserId(token);
        
        logger.debug("Fetching attempt history for user ID: {} and paper ID: {}", userId, paperId);
        
        // Fetch all attempts by this student for this paper
        // Results are ordered by startedAt descending (newest first)
        List<StudentPaperAttempt> attempts = attemptService.getAttemptsByStudentAndPaper(userId, paperId);
        
        logger.info("Found {} attempts for user ID: {} on paper ID: {}", 
                   attempts.size(), userId, paperId);
        
        // Convert entities to DTOs for response
        // DTOs hide sensitive information and provide a clean API contract
        List<StudentPaperAttemptDto> dtos = attemptMapper.toDtoList(attempts);
        
        logger.debug("Successfully mapped {} attempts to DTOs", dtos.size());
        
        return ResponseEntity.ok(dtos);
    }
```

---

## 3. StudentPaperAttemptService.java

### Get Attempts By Student And Paper

```java
    /**
     * Retrieves all attempts by a specific student for a specific paper.
     * 
     * <p>This method is used to display attempt history, allowing students to view
     * their progress over multiple attempts. The results are ordered by start time
     * with the most recent attempts first.
     * 
     * <p><b>Use Cases:</b>
     * <ul>
     *   <li>Student dashboard - showing recent attempts</li>
     *   <li>Progress tracking - comparing performance over time</li>
     *   <li>Review - accessing past feedback and marks</li>
     * </ul>
     * 
     * @param studentId the ID of the student
     * @param paperId the ID of the paper
     * @return list of attempts ordered by start time (newest first), empty list if no attempts found
     * @throws IllegalArgumentException if studentId or paperId is null or invalid
     */
    public List<StudentPaperAttempt> getAttemptsByStudentAndPaper(Long studentId, Long paperId) {
        logger.info("Fetching attempts for student ID: {} and paper ID: {}", studentId, paperId);
        
        // Validate input parameters
        if (studentId == null || paperId == null) {
            logger.error("Invalid parameters: studentId={}, paperId={}", studentId, paperId);
            throw new IllegalArgumentException("Student ID and Paper ID must not be null");
        }
        
        // Record start time for performance logging
        long startTime = System.currentTimeMillis();
        
        // Fetch attempts from repository
        List<StudentPaperAttempt> attempts = attemptRepository
                .findByStudentIdAndPaperIdOrderByStartedAtDesc(studentId, paperId);
        
        // Log performance metrics
        long duration = System.currentTimeMillis() - startTime;
        logger.debug("Query completed in {}ms, found {} attempts", duration, attempts.size());
        
        // Log warning if query is slow (potential performance issue)
        if (duration > 1000) {
            logger.warn("Slow query detected: Fetching attempts took {}ms for student ID: {} and paper ID: {}", 
                       duration, studentId, paperId);
        }
        
        return attempts;
    }
```

---

## 4. StudentPaperAttemptRepository.java

### Repository Query Methods

```java
package com.eduapp.backend.repository;

import com.eduapp.backend.entity.StudentPaperAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for StudentPaperAttempt entity.
 * 
 * <p>Provides data access methods for managing student paper attempts,
 * including attempt history and leaderboard queries.
 */
@Repository
public interface StudentPaperAttemptRepository extends JpaRepository<StudentPaperAttempt, Long> {
    
    /**
     * Finds all attempts by a specific student for a specific paper.
     * 
     * <p>Results are ordered by start time in descending order (newest first).
     * This is used for displaying attempt history to students.
     * 
     * <p><b>Query:</b>
     * <pre>
     * SELECT * FROM student_paper_attempt 
     * WHERE student_id = ? AND paper_id = ? 
     * ORDER BY started_at DESC
     * </pre>
     * 
     * @param studentId the ID of the student
     * @param paperId the ID of the paper
     * @return list of attempts ordered by start time (newest first), empty list if no attempts found
     */
    List<StudentPaperAttempt> findByStudentIdAndPaperIdOrderByStartedAtDesc(Long studentId, Long paperId);
    
    /**
     * Finds all opted-in attempts for a specific paper.
     * 
     * <p>Only returns attempts where the student has explicitly opted in to display
     * their results on the leaderboard. Results are ordered by time taken (ascending)
     * for initial sorting efficiency.
     * 
     * <p><b>Query:</b>
     * <pre>
     * SELECT * FROM student_paper_attempt 
     * WHERE paper_id = ? AND opted_in = true 
     * ORDER BY time_taken_minutes ASC
     * </pre>
     * 
     * <p><b>Note:</b> The final leaderboard ranking is done in the controller layer
     * after calculating total marks and applying the "best attempt per student" logic.
     * 
     * @param paperId the ID of the paper
     * @return list of opted-in attempts ordered by time taken (ascending), empty list if no opted-in attempts
     */
    List<StudentPaperAttempt> findByPaperIdAndOptedInTrueOrderByTimeTakenMinutesAsc(Long paperId);
}
```

---

## 5. Logging Configuration

### application.properties

Add the following logging configuration to control log levels:

```properties
# General logging level
logging.level.root=INFO

# Package-specific logging levels
logging.level.com.eduapp.backend.controller=DEBUG
logging.level.com.eduapp.backend.service=DEBUG
logging.level.com.eduapp.backend.repository=DEBUG

# SQL logging (optional, for debugging database queries)
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Log file configuration
logging.file.name=logs/eduapp.log
logging.file.max-size=10MB
logging.file.max-history=30
```

---

## 6. Error Handling Best Practices

### Example: Enhanced Error Handling

```java
@GetMapping("/paper/{paperId}/history")
public ResponseEntity<List<StudentPaperAttemptDto>> getAttemptHistory(
        @PathVariable Long paperId,
        @RequestHeader(value = "Authorization", required = false) String authHeader) {
    
    try {
        logger.info("Attempt history requested for paper ID: {}", paperId);
        
        // Validate authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("Invalid or missing Authorization header");
            return ResponseEntity.status(401).build();
        }
        
        // Extract and validate token
        String token = authHeader.substring(7);
        Long userId;
        try {
            userId = jwtUtil.extractUserId(token);
        } catch (Exception e) {
            logger.error("Failed to extract user ID from token", e);
            return ResponseEntity.status(401).build();
        }
        
        logger.debug("Fetching attempt history for user ID: {} and paper ID: {}", userId, paperId);
        
        // Fetch attempts
        List<StudentPaperAttempt> attempts = attemptService.getAttemptsByStudentAndPaper(userId, paperId);
        
        logger.info("Found {} attempts for user ID: {} on paper ID: {}", 
                   attempts.size(), userId, paperId);
        
        // Map to DTOs
        List<StudentPaperAttemptDto> dtos = attemptMapper.toDtoList(attempts);
        
        return ResponseEntity.ok(dtos);
        
    } catch (Exception e) {
        logger.error("Error fetching attempt history for paper ID: {}", paperId, e);
        return ResponseEntity.status(500).build();
    }
}
```

---

## 7. Testing Recommendations

### Unit Test Example

```java
@Test
public void testGetLeaderboard_MultipleAttemptsPerStudent_ShowsBestAttempt() {
    // Arrange
    Long paperId = 1L;
    
    // Student 1: Two attempts - second is better
    StudentPaperAttempt attempt1 = createAttempt(1L, paperId, 1L, 80, 60, true);
    StudentPaperAttempt attempt2 = createAttempt(2L, paperId, 1L, 90, 50, true);
    
    // Student 2: One attempt
    StudentPaperAttempt attempt3 = createAttempt(3L, paperId, 2L, 85, 55, true);
    
    when(attemptRepository.findByPaperIdAndOptedInTrueOrderByTimeTakenMinutesAsc(paperId))
        .thenReturn(Arrays.asList(attempt1, attempt2, attempt3));
    
    // Act
    ResponseEntity<List<Map<String, Object>>> response = controller.getLeaderboard(paperId);
    
    // Assert
    assertEquals(2, response.getBody().size());  // Only 2 students
    assertEquals(90, response.getBody().get(0).get("marks"));  // Student 1's best attempt
    assertEquals(85, response.getBody().get(1).get("marks"));  // Student 2's attempt
}
```

---

## Summary

This guide provides:
- ✅ Comprehensive JavaDoc comments for all public methods
- ✅ Detailed inline comments explaining complex logic
- ✅ Strategic logging at INFO, DEBUG, and TRACE levels
- ✅ Error handling with meaningful error messages
- ✅ Performance logging for slow queries
- ✅ Security validation and logging
- ✅ Testing recommendations

**Next Steps:**
1. Apply these templates to the actual backend code
2. Run the application and verify logging output
3. Test all endpoints and review logs
4. Adjust log levels as needed for production
