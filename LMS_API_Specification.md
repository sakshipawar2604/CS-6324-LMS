# LMS API Specification for Backend Development

**Version:** 1.0  
**Base URL:** `http://localhost:8080` (or your backend URL)  
**Authentication:** Bearer Token (JWT)  
**Date:** October 2025

---

## Table of Contents

1. [Standard Error Response Model](#standard-error-response-model)
2. [Authentication APIs](#authentication-apis)
3. [Admin APIs](#admin-apis)
4. [Teacher APIs](#teacher-apis)
5. [Student APIs](#student-apis)
6. [Course Management APIs](#course-management-apis)
7. [Assignment APIs](#assignment-apis)
8. [Submission APIs](#submission-apis)
9. [Resource Management APIs](#resource-management-apis)
10. [Implementation Notes](#implementation-notes)

---

## Standard Error Response Model

All error responses (4xx, 5xx) should follow this structure:

```json
{
  "timestamp": "string (ISO-8601 format)",
  "status": "integer (HTTP status code)",
  "error": "string (error type)",
  "message": "string (human-readable error message)",
  "path": "string (request path)"
}
```

**Example:**

```json
{
  "timestamp": "2025-10-22T10:20:30Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "path": "/auth/login"
}
```

---

## Authentication APIs

### 1. POST /auth/login

**Description:** User authentication and login

**Authentication:** None (public endpoint)

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "string (required, email format)",
  "password": "string (required, min 6 characters)"
}
```

**Request Body Data Types:**

- `email`: String (must be valid email format)
- `password`: String (minimum 6 characters)

**Success Response (200 OK):**

```json
{
  "token": "string (JWT token)",
  "role": "string (enum: 'admin' | 'teacher' | 'student')",
  "user": {
    "user_id": "string",
    "email": "string (email format)",
    "name": "string"
  }
}
```

**Response Data Types:**

- `token`: String (JWT token for authentication)
- `role`: String (must be exactly one of: "admin", "teacher", "student")
- `user.user_id`: String (unique identifier)
- `user.email`: String (email format)
- `user.name`: String (user's full name)

**Example Success Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "teacher",
  "user": {
    "user_id": "teacher_001",
    "email": "teacher@lms.test",
    "name": "TEACHER User"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid JSON or missing required fields
- `401 Unauthorized`: Wrong email/password combination
- `500 Internal Server Error`: Server error

**Frontend Storage:**

- Frontend stores the entire response object in `localStorage` under key "user"
- Subsequent requests attach `Authorization: Bearer <token>` header

---

## Admin APIs

### 2. GET /admin/metrics

**Description:** Get admin dashboard metrics and statistics

**Authentication:** Required (Admin role only)

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:** None

**Success Response (200 OK):**

```json
{
  "total_users": "integer (>= 0)",
  "total_teachers": "integer (>= 0)",
  "total_students": "integer (>= 0)",
  "total_courses": "integer (>= 0)",
  "total_enrollments": "integer (>= 0)",
  "pending_submissions": "integer (>= 0)"
}
```

**Response Data Types:**

- `total_users`: Integer (Number) - Total count of all users in the system
- `total_teachers`: Integer (Number) - Total count of teachers
- `total_students`: Integer (Number) - Total count of students
- `total_courses`: Integer (Number) - Total count of courses
- `total_enrollments`: Integer (Number) - Total count of student enrollments
- `pending_submissions`: Integer (Number) - Count of submissions awaiting grading

**Example Success Response:**

```json
{
  "total_users": 120,
  "total_teachers": 10,
  "total_students": 110,
  "total_courses": 8,
  "total_enrollments": 340,
  "pending_submissions": 15
}
```

**Field Naming:** Use **snake_case** (not camelCase)

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not an admin
- `500 Internal Server Error`: Server error

**Important Notes:**

- All metrics should return 0 if no data exists (never null)
- `pending_submissions` counts all ungraded submissions across all courses

---

## Teacher APIs

### 3. GET /courses?teacherId={teacherId}

**Description:** Get all courses assigned to a specific teacher

**Authentication:** Required (Teacher role)

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `teacherId`: String (required) - Example: "teacher_001"

**Success Response (200 OK):**

```json
[
  {
    "course_id": "string",
    "title": "string",
    "description": "string (nullable)",
    "studentCount": "integer (>= 0)"
  }
]
```

**Response Data Types:**

- `course_id`: String (unique course identifier)
- `title`: String (course title)
- `description`: String or null (course description, can be null)
- `studentCount`: Integer (Number) - Count of enrolled students
  - **Note:** This field uses camelCase (exception to snake_case rule)

**Example Success Response:**

```json
[
  {
    "course_id": "CSE101",
    "title": "Introduction to Computer Science",
    "description": "Fundamentals of algorithms, data structures, and programming.",
    "studentCount": 45
  },
  {
    "course_id": "CSE202",
    "title": "Database Systems",
    "description": "Learn SQL, normalization, and relational database design.",
    "studentCount": 38
  }
]
```

**Empty Result:** Return `200 OK` with empty array `[]` if teacher has no assigned courses

**Error Responses:**

- `400 Bad Request`: Missing teacherId parameter
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not a teacher OR teacherId doesn't match authenticated user
- `500 Internal Server Error`: Server error

**Security Note:**

- Validate that the teacherId matches the authenticated user's ID
- Admins may be allowed to query any teacher's courses (optional)

---

## Student APIs

### 4. GET /enrollments?studentId={studentId}

**Description:** Get all courses enrolled by a specific student

**Authentication:** Required (Student role)

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `studentId`: String (required) - Example: "student_001"

**Success Response (200 OK):**

```json
[
  {
    "course_id": "string",
    "title": "string",
    "description": "string (nullable)",
    "enrolled_at": "string (ISO-8601 datetime)"
  }
]
```

**Response Data Types:**

- `course_id`: String (unique course identifier)
- `title`: String (course title)
- `description`: String or null (course description)
- `enrolled_at`: String (ISO-8601 datetime format: "2025-08-15T09:00:00Z")

**Example Success Response:**

```json
[
  {
    "course_id": "CSE101",
    "title": "Introduction to Computer Science",
    "description": "Learn core programming concepts and logic building.",
    "enrolled_at": "2025-08-15T09:00:00Z"
  },
  {
    "course_id": "CSE202",
    "title": "Database Systems",
    "description": "SQL queries, relational models, and schema design.",
    "enrolled_at": "2025-09-01T09:00:00Z"
  }
]
```

**Empty Result:** Return `200 OK` with empty array `[]` if student has no enrollments

**Error Responses:**

- `400 Bad Request`: Missing studentId parameter
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User cannot view this student's enrollments
- `500 Internal Server Error`: Server error

---

### 5. GET /assignments?studentId={studentId}&status=pending

**Description:** Get pending assignments for a specific student

**Authentication:** Required (Student role)

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `studentId`: String (required) - Example: "student_001"
- `status`: String (required) - Must be "pending"

**Success Response (200 OK):**

```json
[
  {
    "assignment_id": "string",
    "title": "string",
    "course_title": "string",
    "due_date": "string (ISO-8601 datetime)"
  }
]
```

**Response Data Types:**

- `assignment_id`: String (unique assignment identifier)
- `title`: String (assignment title)
- `course_title`: String (name of the course this assignment belongs to)
- `due_date`: String (ISO-8601 datetime: "2025-10-25T09:00:00Z")

**Example Success Response:**

```json
[
  {
    "assignment_id": "A101",
    "title": "Data Structures Assignment 1",
    "course_title": "Introduction to Computer Science",
    "due_date": "2025-10-25T09:00:00Z"
  },
  {
    "assignment_id": "A202",
    "title": "SQL Query Practice",
    "course_title": "Database Systems",
    "due_date": "2025-10-30T09:00:00Z"
  }
]
```

**Empty Result:** Return `200 OK` with empty array `[]` if no pending assignments

**Error Responses:**

- `400 Bad Request`: Missing parameters or invalid status value
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User cannot view this student's assignments
- `500 Internal Server Error`: Server error

---

### 6. GET /submissions?studentId={studentId}&graded=true

**Description:** Get graded submissions for a specific student

**Authentication:** Required (Student role)

**Request Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `studentId`: String (required) - Example: "student_001"
- `graded`: Boolean (required) - Must be "true"

**Success Response (200 OK):**

```json
[
  {
    "submission_id": "string",
    "assignment_title": "string",
    "course_title": "string",
    "grade": "string (nullable)",
    "feedback": "string (nullable)"
  }
]
```

**Response Data Types:**

- `submission_id`: String (unique submission identifier)
- `assignment_title`: String (title of the assignment)
- `course_title`: String (name of the course)
- `grade`: String or null (grade received, e.g., "A", "B+", "95")
- `feedback`: String or null (teacher's feedback comments)

**Example Success Response:**

```json
[
  {
    "submission_id": "S101",
    "assignment_title": "Sorting Algorithms",
    "course_title": "Data Structures",
    "grade": "A",
    "feedback": "Excellent work!"
  },
  {
    "submission_id": "S102",
    "assignment_title": "ER Diagram Design",
    "course_title": "Database Systems",
    "grade": "B+",
    "feedback": "Good effort, minor schema issue."
  }
]
```

**Empty Result:** Return `200 OK` with empty array `[]` if no graded submissions

**Error Responses:**

- `400 Bad Request`: Missing parameters
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Access denied
- `500 Internal Server Error`: Server error

---

## Course Management APIs

### 7. GET /courses/{courseId}

**Description:** Get detailed information about a specific course

**Authentication:** Required (Any authenticated user)

**Request Headers:**

```
Authorization: Bearer <token>
```

**Path Parameters:**

- `courseId`: String (required) - Example: "CSE101"

**Success Response (200 OK):**

```json
{
  "course_id": "string",
  "title": "string",
  "description": "string (nullable)",
  "teacher_name": "string",
  "start_date": "string (YYYY-MM-DD format)",
  "end_date": "string (YYYY-MM-DD format)"
}
```

**Response Data Types:**

- `course_id`: String (unique course identifier)
- `title`: String (course title)
- `description`: String or null (detailed course description)
- `teacher_name`: String (name of the instructor)
- `start_date`: String (date format: "2025-08-01")
- `end_date`: String (date format: "2025-12-15")

**Example Success Response:**

```json
{
  "course_id": "CSE101",
  "title": "Introduction to Computer Science",
  "description": "Fundamentals of algorithms, data structures, and programming.",
  "teacher_name": "Dr. John Smith",
  "start_date": "2025-08-01",
  "end_date": "2025-12-15"
}
```

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Course with given ID not found
- `500 Internal Server Error`: Server error

---

### 8. GET /courses/{courseId}/assignments

**Description:** Get all assignments for a specific course

**Authentication:** Required (Teacher or enrolled student)

**Request Headers:**

```
Authorization: Bearer <token>
```

**Path Parameters:**

- `courseId`: String (required) - Example: "CSE101"

**Success Response (200 OK):**

```json
[
  {
    "assignment_id": "string",
    "title": "string",
    "due_date": "string (YYYY-MM-DD format)",
    "submissions_pending": "integer (>= 0, for teachers only)",
    "status": "string (for students only)"
  }
]
```

**Response Data Types:**

- `assignment_id`: String (unique assignment identifier)
- `title`: String (assignment title)
- `due_date`: String (date format: "2025-10-30")
- `submissions_pending`: Integer (Number) - Only include for teachers
- `status`: String - Only include for students (values: "Submitted", "Not Submitted")

**Example Success Response (Teacher View):**

```json
[
  {
    "assignment_id": "A1",
    "title": "Algorithm Analysis",
    "due_date": "2025-10-30",
    "submissions_pending": 3
  },
  {
    "assignment_id": "A2",
    "title": "Sorting Project",
    "due_date": "2025-11-15",
    "submissions_pending": 5
  }
]
```

**Example Success Response (Student View):**

```json
[
  {
    "assignment_id": "A1",
    "title": "Algorithm Analysis",
    "due_date": "2025-10-30",
    "status": "Submitted"
  },
  {
    "assignment_id": "A2",
    "title": "Sorting Project",
    "due_date": "2025-11-15",
    "status": "Not Submitted"
  }
]
```

**Important Notes:**

- Include `submissions_pending` field ONLY if the authenticated user is a teacher
- Include `status` field ONLY if the authenticated user is a student
- Never include both fields in the same response

**Empty Result:** Return `200 OK` with empty array `[]` if no assignments exist

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User not authorized to view this course's assignments
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

---

### 9. GET /courses/{courseId}/resources

**Description:** Get all learning resources for a specific course

**Authentication:** Required (Teacher or enrolled student)

**Request Headers:**

```
Authorization: Bearer <token>
```

**Path Parameters:**

- `courseId`: String (required) - Example: "CSE101"

**Success Response (200 OK):**

```json
[
  {
    "resource_id": "string",
    "title": "string",
    "url": "string (full URL)",
    "uploaded_at": "string (ISO-8601 datetime)"
  }
]
```

**Response Data Types:**

- `resource_id`: String (unique resource identifier)
- `title`: String (resource title/name)
- `url`: String (full URL to access/download the resource)
- `uploaded_at`: String (ISO-8601 datetime: "2025-10-15T09:00:00Z")

**Example Success Response:**

```json
[
  {
    "resource_id": "R101",
    "title": "Lecture 1 - Introduction",
    "url": "https://storage.lms.com/resources/lecture1.pdf",
    "uploaded_at": "2025-10-15T09:00:00Z"
  },
  {
    "resource_id": "R102",
    "title": "Lecture 2 - Algorithms Basics",
    "url": "https://storage.lms.com/resources/lecture2.pdf",
    "uploaded_at": "2025-10-17T10:30:00Z"
  }
]
```

**Empty Result:** Return `200 OK` with empty array `[]` if no resources uploaded

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User not authorized to view this course's resources
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

---

### 10. GET /courses/{courseId}/students

**Description:** Get list of all enrolled students in a course

**Authentication:** Required (Teacher or Admin only)

**Request Headers:**

```
Authorization: Bearer <token>
```

**Path Parameters:**

- `courseId`: String (required) - Example: "CSE101"

**Success Response (200 OK):**

```json
[
  {
    "student_id": "string",
    "name": "string",
    "email": "string (email format)"
  }
]
```

**Response Data Types:**

- `student_id`: String (unique student identifier)
- `name`: String (student's full name)
- `email`: String (student's email address in valid email format)

**Example Success Response:**

```json
[
  {
    "student_id": "S1",
    "name": "Alice Johnson",
    "email": "alice@example.com"
  },
  {
    "student_id": "S2",
    "name": "Bob Brown",
    "email": "bob@example.com"
  }
]
```

**Empty Result:** Return `200 OK` with empty array `[]` if no students enrolled

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not a teacher or admin
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

---

## Assignment APIs

### 11. POST /courses/{courseId}/assignments

**Description:** Create a new assignment for a course (Teacher only)

**Authentication:** Required (Teacher role)

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**

- `courseId`: String (required) - Example: "CSE101"

**Request Body:**

```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "due_date": "string (required, YYYY-MM-DD format)",
  "max_score": "integer (optional)"
}
```

**Request Body Data Types:**

- `title`: String (required, assignment title)
- `description`: String (optional, detailed description)
- `due_date`: String (required, format: "2025-10-30")
- `max_score`: Integer (optional, maximum points possible)

**Example Request Body:**

```json
{
  "title": "Algorithm Analysis Assignment",
  "description": "Analyze time complexity of sorting algorithms",
  "due_date": "2025-11-15",
  "max_score": 100
}
```

**Success Response (201 Created):**

```json
{
  "assignment_id": "string",
  "title": "string",
  "description": "string (nullable)",
  "due_date": "string (YYYY-MM-DD)",
  "submissions_pending": "integer (should be 0)",
  "max_score": "integer (nullable)"
}
```

**Response Data Types:**

- `assignment_id`: String (newly generated unique identifier)
- `title`: String (assignment title)
- `description`: String or null (assignment description)
- `due_date`: String (format: "2025-11-15")
- `submissions_pending`: Integer (should be 0 for new assignment)
- `max_score`: Integer or null (maximum score)

**Example Success Response:**

```json
{
  "assignment_id": "A123",
  "title": "Algorithm Analysis Assignment",
  "description": "Analyze time complexity of sorting algorithms",
  "due_date": "2025-11-15",
  "submissions_pending": 0,
  "max_score": 100
}
```

**Error Responses:**

- `400 Bad Request`: Invalid data, missing required fields, or invalid date format
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not a teacher or not assigned to this course
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

---

## Submission APIs

### 12. POST /submissions

**Description:** Submit an assignment solution (Student only)

**Authentication:** Required (Student role)

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**

```
assignment_id: string (required)
student_id: string (required)
file: File (required, PDF/DOC/DOCX)
comments: string (optional)
```

**Request Body Data Types:**

- `assignment_id`: String (required, ID of the assignment being submitted)
- `student_id`: String (required, ID of the student submitting)
- `file`: File (required, supported formats: PDF, DOC, DOCX, max size: 10MB)
- `comments`: String (optional, student's comments/notes)

**Success Response (201 Created):**

```json
{
  "submission_id": "string",
  "assignment_id": "string",
  "submitted_at": "string (ISO-8601 datetime)",
  "status": "string",
  "file_url": "string (URL to uploaded file)"
}
```

**Response Data Types:**

- `submission_id`: String (newly generated unique identifier)
- `assignment_id`: String (ID of the assignment)
- `submitted_at`: String (ISO-8601 datetime: "2025-10-22T14:30:00Z")
- `status`: String (typically "Submitted")
- `file_url`: String (full URL to access the uploaded file)

**Example Success Response:**

```json
{
  "submission_id": "SUB456",
  "assignment_id": "A123",
  "submitted_at": "2025-10-22T14:30:00Z",
  "status": "Submitted",
  "file_url": "https://storage.lms.com/submissions/student_001_assignment_123.pdf"
}
```

**Error Responses:**

- `400 Bad Request`: Missing fields, invalid file format, or file too large
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not a student or not enrolled in the course
- `404 Not Found`: Assignment not found
- `409 Conflict`: Assignment already submitted (if resubmission not allowed)
- `500 Internal Server Error`: Server error

**Important Notes:**

- File should be stored securely (AWS S3, Azure Blob Storage, or local storage)
- Return full URL to the uploaded file
- Validate file type and size before accepting
- Consider implementing virus scanning for uploaded files

---

### 13. GET /assignments/{assignmentId}/submissions

**Description:** Get all student submissions for an assignment (Teacher only)

**Authentication:** Required (Teacher role)

**Request Headers:**

```
Authorization: Bearer <token>
```

**Path Parameters:**

- `assignmentId`: String (required) - Example: "A1"

**Success Response (200 OK):**

```json
[
  {
    "submission_id": "string",
    "student_id": "string",
    "student_name": "string",
    "submitted_at": "string (ISO-8601 datetime)",
    "file_url": "string (URL)",
    "grade": "integer (nullable, 0-100)",
    "feedback": "string (nullable)"
  }
]
```

**Response Data Types:**

- `submission_id`: String (unique submission identifier)
- `student_id`: String (student's unique identifier)
- `student_name`: String (student's full name)
- `submitted_at`: String (ISO-8601 datetime: "2025-10-18T10:00:00Z")
- `file_url`: String (full URL to the submitted file)
- `grade`: Integer or null (grade value 0-100, null if not graded yet)
- `feedback`: String or null (teacher's feedback, null if not graded yet)

**Example Success Response:**

```json
[
  {
    "submission_id": "SUB101",
    "student_id": "S1",
    "student_name": "Alice Johnson",
    "submitted_at": "2025-10-18T10:00:00Z",
    "file_url": "https://storage.lms.com/submissions/alice_assignment1.pdf",
    "grade": 95,
    "feedback": "Excellent work! Clear explanations and neat formatting."
  },
  {
    "submission_id": "SUB102",
    "student_id": "S2",
    "student_name": "Bob Brown",
    "submitted_at": "2025-10-19T11:30:00Z",
    "file_url": "https://storage.lms.com/submissions/bob_assignment1.pdf",
    "grade": 78,
    "feedback": "Good effort, but a few minor logical errors."
  },
  {
    "submission_id": "SUB103",
    "student_id": "S3",
    "student_name": "Charlie White",
    "submitted_at": "2025-10-20T09:45:00Z",
    "file_url": "https://storage.lms.com/submissions/charlie_assignment1.pdf",
    "grade": null,
    "feedback": null
  }
]
```

**Important Notes:**

- `grade` and `feedback` should be `null` (not empty string) if not graded yet
- Include all submissions, both graded and ungraded
- Sort by submission date (newest first recommended)

**Empty Result:** Return `200 OK` with empty array `[]` if no submissions yet

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not a teacher or not assigned to this course
- `404 Not Found`: Assignment not found
- `500 Internal Server Error`: Server error

---

## Resource Management APIs

### 14. POST /courses/{courseId}/resources

**Description:** Upload a learning resource to a course (Teacher only)

**Authentication:** Required (Teacher role)

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Path Parameters:**

- `courseId`: String (required) - Example: "CSE101"

**Request Body (FormData):**

```
title: string (required)
file: File (required, PDF/PPT/DOC/etc.)
description: string (optional)
```

**Request Body Data Types:**

- `title`: String (required, resource title/name)
- `file`: File (required, supported formats: PDF, PPT, PPTX, DOC, DOCX, max size: 50MB)
- `description`: String (optional, resource description)

**Success Response (201 Created):**

```json
{
  "resource_id": "string",
  "title": "string",
  "url": "string (URL to uploaded file)",
  "uploaded_at": "string (ISO-8601 datetime)"
}
```

**Response Data Types:**

- `resource_id`: String (newly generated unique identifier)
- `title`: String (resource title)
- `url`: String (full URL to access/download the resource)
- `uploaded_at`: String (ISO-8601 datetime: "2025-10-22T14:30:00Z")

**Example Success Response:**

```json
{
  "resource_id": "R789",
  "title": "Week 5 Lecture Slides",
  "url": "https://storage.lms.com/resources/week5_slides.pdf",
  "uploaded_at": "2025-10-22T14:30:00Z"
}
```

**Error Responses:**

- `400 Bad Request`: Missing fields, invalid file format, or file too large
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not a teacher or not assigned to this course
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Server error

**Important Notes:**

- Store files securely (AWS S3, Azure Blob Storage, or local storage)
- Return full URL to the uploaded file
- Validate file type and size before accepting
- Consider implementing virus scanning for uploaded files
- Set appropriate file size limits (recommended: 50MB for resources)

---

## Implementation Notes

### 1. Field Naming Convention

**Rule:** Use **snake_case** for all JSON field names

**Examples:**

- `user_id` ✅ (correct)
- `userId` ❌ (wrong)
- `enrolled_at` ✅ (correct)
- `enrolledAt` ❌ (wrong)

**Exception:** `studentCount` uses camelCase (legacy compatibility)

**Spring Boot Implementation:**

```java
public class CourseResponse {
    @JsonProperty("course_id")
    private String courseId;

    @JsonProperty("teacher_name")
    private String teacherName;

    // Getters and setters use camelCase in Java
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
}
```

---

### 2. Date and Time Formats

**Two formats are used:**

**A. ISO-8601 DateTime (with timezone)**

- Format: `"2025-10-22T14:30:00Z"`
- Used for: `submitted_at`, `enrolled_at`, `uploaded_at`
- Includes time and timezone
- Always use UTC timezone (Z suffix)

**B. Date Only (YYYY-MM-DD)**

- Format: `"2025-10-30"`
- Used for: `due_date`, `start_date`, `end_date`
- No time component
- No timezone

**Java Implementation:**

```java
// For ISO-8601 DateTime
@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
private Date submittedAt;

// For Date Only
@JsonFormat(pattern = "yyyy-MM-dd")
private LocalDate dueDate;
```

---

### 3. Handling Empty Results

**Rule:** Always return `200 OK` with empty array `[]` for empty results

**Never return:**

- `204 No Content` ❌
- `null` ❌
- `undefined` ❌

**Example:**

```java
// Correct way to handle empty results
@GetMapping("/courses/{courseId}/assignments")
public ResponseEntity<List<Assignment>> getAssignments(@PathVariable String courseId) {
    List<Assignment> assignments = assignmentService.findByCourseId(courseId);
    // Even if list is empty, return 200 with empty array
    return ResponseEntity.ok(assignments); // Returns [] if empty
}
```

**Why:** Frontend expects arrays and will iterate over them. Returning null or 204 will cause errors.

---

### 4. Nullable Fields

**Fields that can be null:**

- `description` (courses, assignments)
- `grade` (submissions - null means not graded yet)
- `feedback` (submissions - null means no feedback yet)
- `max_score` (assignments)

**Important:**

- Use `null` in JSON, not empty string `""`
- Document which fields are nullable in your API docs

**Example:**

```json
{
  "submission_id": "SUB103",
  "grade": null, // ✅ Correct: null means not graded
  "feedback": null // ✅ Correct: null means no feedback
}
```

**Wrong:**

```json
{
  "submission_id": "SUB103",
  "grade": "", // ❌ Wrong: use null, not empty string
  "feedback": "" // ❌ Wrong: use null, not empty string
}
```

---

### 5. Authorization and Security

**All endpoints (except `/auth/login`) require authentication:**

**Request Header:**

```
Authorization: Bearer <token>
```

**Security Checks:**

1. **Token Validation:** Verify JWT token is valid and not expired
2. **Role Validation:** Check user has required role for the endpoint
3. **Resource Access:** Verify user has permission to access the specific resource

**Example Security Matrix:**

| Endpoint                        | Allowed Roles    | Additional Checks                       |
| ------------------------------- | ---------------- | --------------------------------------- |
| `/admin/metrics`                | Admin only       | None                                    |
| `/courses?teacherId=X`          | Teacher          | teacherId must match authenticated user |
| `/enrollments?studentId=X`      | Student          | studentId must match authenticated user |
| `/courses/{id}/assignments`     | Teacher, Student | Must be assigned/enrolled in course     |
| `/submissions` (POST)           | Student          | Must be enrolled in course              |
| `/assignments/{id}/submissions` | Teacher          | Must be assigned to course              |

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Valid token but insufficient permissions

---

### 6. File Upload Handling

**Supported File Types:**

- **Submissions:** PDF, DOC, DOCX
- **Resources:** PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX

**File Size Limits:**

- **Submissions:** 10 MB maximum
- **Resources:** 50 MB maximum

**Storage Requirements:**

- Store files securely (AWS S3, Azure Blob Storage, or local storage)
- Generate unique file names to prevent conflicts
- Return full URL to uploaded file
- Implement virus scanning (recommended)

**File URL Format:**

```
https://storage.lms.com/submissions/{filename}
https://storage.lms.com/resources/{filename}
```

**Spring Boot Example:**

```java
@PostMapping("/submissions")
public ResponseEntity<SubmissionResponse> submitAssignment(
    @RequestParam("assignment_id") String assignmentId,
    @RequestParam("student_id") String studentId,
    @RequestParam("file") MultipartFile file,
    @RequestParam(value = "comments", required = false) String comments
) {
    // Validate file type
    if (!isValidFileType(file)) {
        return ResponseEntity.badRequest().build();
    }

    // Validate file size
    if (file.getSize() > 10 * 1024 * 1024) { // 10MB
        return ResponseEntity.badRequest().build();
    }

    // Store file and get URL
    String fileUrl = fileStorageService.store(file);

    // Create submission record
    SubmissionResponse response = submissionService.create(
        assignmentId, studentId, fileUrl, comments
    );

    return ResponseEntity.status(201).body(response);
}
```

---

### 7. Error Handling Best Practices

**Use Standard HTTP Status Codes:**

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request (resource created)
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource conflict (e.g., duplicate submission)
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

**Error Response Structure:**

```json
{
  "timestamp": "2025-10-22T10:20:30Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid email format",
  "path": "/auth/login"
}
```

**Spring Boot Global Exception Handler:**

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
        MethodArgumentNotValidException ex,
        HttpServletRequest request
    ) {
        ErrorResponse error = new ErrorResponse();
        error.setTimestamp(Instant.now().toString());
        error.setStatus(400);
        error.setError("Bad Request");
        error.setMessage(ex.getBindingResult().getFieldError().getDefaultMessage());
        error.setPath(request.getRequestURI());

        return ResponseEntity.status(400).body(error);
    }

    // Add more exception handlers...
}
```

---

### 8. Testing Recommendations

**Test Each Endpoint For:**

1. **Success Cases:** Valid input returns expected response
2. **Validation:** Invalid input returns 400 with error message
3. **Authentication:** Missing token returns 401
4. **Authorization:** Wrong role returns 403
5. **Not Found:** Invalid ID returns 404
6. **Empty Results:** No data returns 200 with empty array

**Example Test Cases for POST /auth/login:**

```
✅ Valid credentials → 200 with token
❌ Invalid email format → 400
❌ Wrong password → 401
❌ Missing email field → 400
❌ Missing password field → 400
```

---

### 9. Database Considerations

**Recommended Table Structure:**

**Users Table:**

- user_id (PK, String)
- email (String, unique)
- password (String, hashed)
- name (String)
- role (Enum: admin, teacher, student)

**Courses Table:**

- course_id (PK, String)
- title (String)
- description (Text, nullable)
- teacher_id (FK → Users)
- start_date (Date)
- end_date (Date)

**Enrollments Table:**

- enrollment_id (PK, auto-increment)
- student_id (FK → Users)
- course_id (FK → Courses)
- enrolled_at (DateTime)

**Assignments Table:**

- assignment_id (PK, String)
- course_id (FK → Courses)
- title (String)
- description (Text, nullable)
- due_date (Date)
- max_score (Integer, nullable)

**Submissions Table:**

- submission_id (PK, String)
- assignment_id (FK → Assignments)
- student_id (FK → Users)
- file_url (String)
- submitted_at (DateTime)
- grade (Integer, nullable)
- feedback (Text, nullable)
- status (String)

**Resources Table:**

- resource_id (PK, String)
- course_id (FK → Courses)
- title (String)
- url (String)
- uploaded_at (DateTime)

---

### 10. Performance Optimization

**Recommendations:**

1. **Caching:** Cache frequently accessed data (course details, user info)
2. **Pagination:** Implement pagination for large lists (not required initially)
3. **Indexing:** Add database indexes on frequently queried fields
4. **Lazy Loading:** Use lazy loading for relationships
5. **Connection Pooling:** Configure proper database connection pooling

**Example Caching:**

```java
@Cacheable("courses")
@GetMapping("/courses/{courseId}")
public ResponseEntity<CourseResponse> getCourse(@PathVariable String courseId) {
    // This result will be cached
    CourseResponse course = courseService.findById(courseId);
    return ResponseEntity.ok(course);
}
```

---

## Summary Checklist for Backend Developer

### Must-Have Features:

- ✅ All 14 API endpoints implemented
- ✅ JWT authentication on all endpoints (except login)
- ✅ Role-based authorization (admin, teacher, student)
- ✅ File upload for submissions and resources
- ✅ Proper error handling with standard error model
- ✅ snake_case field naming (except studentCount)
- ✅ ISO-8601 datetime format
- ✅ Empty arrays return 200 (not 204)
- ✅ Nullable fields use null (not empty string)

### Security Requirements:

- ✅ Password hashing (BCrypt recommended)
- ✅ JWT token generation and validation
- ✅ Token expiration handling
- ✅ Role validation on each endpoint
- ✅ Resource access validation
- ✅ File type and size validation
- ✅ SQL injection prevention (use parameterized queries)
- ✅ XSS prevention

### Testing Requirements:

- ✅ Unit tests for services
- ✅ Integration tests for controllers
- ✅ Test all success cases
- ✅ Test all error cases (400, 401, 403, 404, 500)
- ✅ Test with different user roles

### Documentation:

- ✅ API documentation (Swagger/OpenAPI recommended)
- ✅ Setup instructions
- ✅ Environment configuration
- ✅ Database schema documentation

---

## Contact Information

**Frontend Developer:** [Your Name]  
**Project:** CS6324 Learning Management System  
**Date:** October 2025

For any questions or clarifications about this API specification, please contact the frontend team.

---

**End of Document**
