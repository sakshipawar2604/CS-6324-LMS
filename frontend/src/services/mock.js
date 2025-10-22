// enable axios mocks in development only
import MockAdapter from "axios-mock-adapter";
import api from "./http";
import authData from "../mock/auth.json";

/**
 * Call this once at app start in dev to register mocks.
 * Replace this whole file with nothing when you connect Spring Boot.
 */
export function setupMocks() {
  if (import.meta.env.PROD) return; // don't mock in production

  const mock = new MockAdapter(api, { delayResponse: 400 }); // small delay to feel real

  // ---- AUTH ----
  mock.onPost("/auth/login").reply((config) => {
    try {
      const body = JSON.parse(config.data || "{}");
      const { email, password } = body || {};
      const found = authData.users.find(
        (u) => u.email === email && u.password === password
      );
      if (!found) {
        return [401, { message: "Invalid credentials" }];
      }
      const token = authData.tokens[found.role] || "mock-jwt";
      return [
        200,
        {
          token,
          role: found.role,
          user: {
            user_id:
              found.role === "admin"
                ? "admin_001"
                : found.role === "teacher"
                ? "teacher_001"
                : "student_001",
            email: found.email,
            name: found.role.toUpperCase() + " User",
          },
        },
      ];
    } catch {
      return [400, { message: "Bad request" }];
    }
  });

  // ---- ADMIN DASHBOARD METRICS ----
  mock.onGet("/admin/metrics").reply(200, {
    total_users: 120,
    total_teachers: 10,
    total_students: 110,
    total_courses: 8,
    total_enrollments: 340,
  });

  // ---- TEACHER DASHBOARD ----
  mock.onGet(/\/courses(\?.*)?$/).reply((config) => {
    console.log("Mock hit:", config.url); // added this to verify

    // Parses the teacherId from query params
    const url = new URL(config.url, "http://localhost");
    const teacherId = url.searchParams.get("teacherId");

    console.log("Teacher ID from request:", teacherId); // Debug log

    // Only returns courses for teachers (not admins/students)
    if (teacherId && teacherId.startsWith("teacher_")) {
      const exampleCourses = [
        {
          course_id: "CSE101",
          title: "Introduction to Computer Science",
          description:
            "Fundamentals of algorithms, data structures, and programming.",
          studentCount: 45,
        },
        {
          course_id: "CSE202",
          title: "Database Systems",
          description:
            "Learn SQL, normalization, and relational database design.",
          studentCount: 38,
        },
        {
          course_id: "CSE305",
          title: "Operating Systems",
          description:
            "Threads, processes, memory management, and scheduling concepts.",
          studentCount: 40,
        },
        {
          course_id: "CSE404",
          title: "Software Engineering",
          description:
            "Agile development, design patterns, and project planning.",
          studentCount: 52,
        },
      ];

      return [200, exampleCourses];
    }

    // Return's empty array for non-teachers or invalid teacher IDs
    return [200, []];
  });

  // ---- STUDENT DASHBOARD ----

  // Enrollments (student courses)
  mock.onGet(/\/enrollments\?studentId=.*/).reply(() => {
    const enrolledCourses = [
      {
        course_id: "CSE101",
        title: "Introduction to Computer Science",
        description: "Learn core programming concepts and logic building.",
        enrolled_at: "2025-08-15T09:00:00Z",
      },
      {
        course_id: "CSE202",
        title: "Database Systems",
        description: "SQL queries, relational models, and schema design.",
        enrolled_at: "2025-09-01T09:00:00Z",
      },
    ];
    return [200, enrolledCourses];
  });

  // Pending Assignments
  mock.onGet(/\/assignments\?studentId=.*&status=pending/).reply(() => {
    const pendingAssignments = [
      {
        assignment_id: "A101",
        title: "Data Structures Assignment 1",
        course_title: "Introduction to Computer Science",
        due_date: "2025-10-25T09:00:00Z",
      },
      {
        assignment_id: "A202",
        title: "SQL Query Practice",
        course_title: "Database Systems",
        due_date: "2025-10-30T09:00:00Z",
      },
    ];
    return [200, pendingAssignments];
  });

  // Recent Grades
  mock.onGet(/\/submissions\?studentId=.*&graded=true/).reply(() => {
    const recentGrades = [
      {
        submission_id: "S101",
        assignment_title: "Sorting Algorithms",
        course_title: "Data Structures",
        grade: "A",
        feedback: "Excellent work!",
      },
      {
        submission_id: "S102",
        assignment_title: "ER Diagram Design",
        course_title: "Database Systems",
        grade: "B+",
        feedback: "Good effort, minor schema issue.",
      },
    ];
    return [200, recentGrades];
  });

  // ---- COURSE DETAILS ----
  mock.onGet(/\/courses\/CSE101$/).reply(200, {
    course_id: "CSE101",
    title: "Introduction to Computer Science",
    description:
      "Fundamentals of algorithms, data structures, and programming.",
    teacher_name: "Dr. John Smith",
    start_date: "2025-08-01",
    end_date: "2025-12-15",
  });

  mock.onGet(/\/courses\/CSE101\/assignments$/).reply(200, [
    {
      assignment_id: "A1",
      title: "Algorithm Analysis",
      due_date: "2025-10-30",
      submissions_pending: 3,
      status: "Submitted",
    },
    {
      assignment_id: "A2",
      title: "Sorting Project",
      due_date: "2025-11-15",
      submissions_pending: 5,
      status: "Not Submitted",
    },
  ]);

  mock.onGet(/\/courses\/CSE101\/resources$/).reply(200, [
    {
      resource_id: "R1",
      title: "Lecture Notes Week 1",
      url: "https://example.com/notes1.pdf",
    },
    {
      resource_id: "R2",
      title: "Sorting Algorithms Slides",
      url: "https://example.com/slides2.pdf",
    },
  ]);

  mock.onGet(/\/courses\/CSE101\/students$/).reply(200, [
    { student_id: "S1", name: "Alice Johnson", email: "alice@example.com" },
    { student_id: "S2", name: "Bob Brown", email: "bob@example.com" },
  ]);

  // ---- ASSIGNMENT CREATION ----
  mock.onPost(/\/courses\/CSE101\/assignments$/).reply((config) => {
    const newAssignment = JSON.parse(config.data);
    newAssignment.assignment_id = "A" + Math.floor(Math.random() * 1000);
    newAssignment.submissions_pending = 0;
    console.log("Mock new assignment:", newAssignment);
    return [201, newAssignment];
  });

  // ---- STUDENT SUBMISSION ----
  mock.onPost("/submissions").reply((config) => {
    const formData = config.data;
    const file = formData.get("file");
    console.log("Mock student submission:", file?.name);
    return [
      201,
      {
        submission_id: "SUB" + Math.floor(Math.random() * 1000),
        assignment_id: formData.get("assignment_id"),
        submitted_at: new Date().toISOString(),
        status: "Submitted",
        file_url: `https://mock-storage.com/submissions/${
          file?.name || "file.pdf"
        }`,
      },
    ];
  });

  // ---- TEACHER VIEW SUBMISSIONS ----
  mock.onGet(/\/assignments\/.*\/submissions$/).reply(200, [
    {
      submission_id: "SUB101",
      student_id: "S1",
      student_name: "Alice Johnson",
      submitted_at: "2025-10-18T10:00:00Z",
      file_url: "https://mock-storage.com/submissions/alice_assignment1.pdf",
      grade: 95,
      feedback: "Excellent work! Clear explanations and neat formatting.",
    },
    {
      submission_id: "SUB102",
      student_id: "S2",
      student_name: "Bob Brown",
      submitted_at: "2025-10-19T11:30:00Z",
      file_url: "https://mock-storage.com/submissions/bob_assignment1.pdf",
      grade: 78,
      feedback: "Good effort, but a few minor logical errors.",
    },
    {
      submission_id: "SUB103",
      student_id: "S3",
      student_name: "Charlie White",
      submitted_at: "2025-10-20T09:45:00Z",
      file_url: "https://mock-storage.com/submissions/charlie_assignment1.pdf",
      grade: null,
      feedback: null,
    },
  ]);

  // ---- COURSE RESOURCES ----

  // Fetch resources
  mock.onGet(/\/courses\/.*\/resources$/).reply(() => {
    const resources = [
      {
        resource_id: "R101",
        title: "Lecture 1 - Introduction",
        url: "https://mock-storage.com/resources/lecture1.pdf",
        uploaded_at: "2025-10-15T09:00:00Z",
      },
      {
        resource_id: "R102",
        title: "Lecture 2 - Algorithms Basics",
        url: "https://mock-storage.com/resources/lecture2.pdf",
        uploaded_at: "2025-10-17T10:30:00Z",
      },
    ];
    return [200, resources];
  });

  // Upload new resource
  mock.onPost(/\/courses\/.*\/resources$/).reply((config) => {
    const formData = config.data;
    const file = formData.get("file");
    const title = formData.get("title");
    console.log(" Mock upload resource:", title, file?.name);
    return [
      201,
      {
        resource_id: "R" + Math.floor(Math.random() * 1000),
        title,
        url: `https://mock-storage.com/resources/${
          file?.name || "newfile.pdf"
        }`,
        uploaded_at: new Date().toISOString(),
      },
    ];
  });

  // fallback: let any unmatched request pass through (to real backend if running)
  mock.onAny().passThrough();
}
