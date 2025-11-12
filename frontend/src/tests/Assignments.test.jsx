import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* ---------------- Minimal API + toast mocks (hoisted) ---------------- */
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("../services/http", () => ({
  __esModule: true,
  default: { get: api.get, post: api.post },
}));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("react-hot-toast", () => {
  const t = { success: toast.success, error: toast.error };
  return { __esModule: true, default: t, success: t.success, error: t.error };
});

/* ---------------- Components under test (adjust paths if needed) ---------------- */
import AssignmentForm from "../components/AssignmentForm.jsx";
import AssignmentSubmissionsModal from "../components/AssignmentSubmissionsModal.jsx";

/* -------------------------------- Tests -------------------------------- */
describe("Assignments (simple)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AssignmentForm: submits successfully (API called + success toast)", async () => {
    api.post.mockResolvedValueOnce({ status: 201, data: {} });

    const { container } = render(
      <AssignmentForm courseId={1} onSuccess={vi.fn()} onClose={vi.fn()} />
    );

    // Select by name attributes (labels are not associated via htmlFor)
    const titleInput = container.querySelector('input[name="title"]');
    const descTextarea = container.querySelector('textarea[name="description"]');
    const dueDateInput = container.querySelector('input[name="dueDate"]');

    await userEvent.type(titleInput, "HW1");
    if (descTextarea) await userEvent.type(descTextarea, "Intro task");

    // Set date reliably for <input type="date">
    if (dueDateInput) {
      fireEvent.change(dueDateInput, { target: { value: "2025-12-31" } });
    }

    // Upload a file via hidden #fileUpload (label points to it)
    const fileInput = container.querySelector("#fileUpload");
    const file = new File(["dummy"], "assignment.pdf", { type: "application/pdf" });
    await userEvent.upload(fileInput, file);

    // Submit (supports Create or Update button text)
    const submitBtn =
      screen.queryByRole("button", { name: /create/i }) ??
      screen.getByRole("button", { name: /update/i });
    await userEvent.click(submitBtn);

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("AssignmentSubmissionsModal: loads one row, opens Grade, saves, refreshes", async () => {
    // Initial list
    api.get.mockResolvedValueOnce({
      data: [
        {
          submission_id: 42,
          student_name: "Alice",
          submitted_at: "2025-11-10T12:00:00Z",
          file_url: "https://example.com/submission.pdf",
          grade: null,
          feedback: null,
        },
      ],
    });

    // Save grade
    api.post.mockResolvedValueOnce({ data: {} });

    // Refresh list after save
    api.get.mockResolvedValueOnce({
      data: [
        {
          submission_id: 42,
          student_name: "Alice",
          submitted_at: "2025-11-10T12:00:00Z",
          file_url: "https://example.com/submission.pdf",
          grade: 90,
          feedback: "Good job",
        },
      ],
    });

    render(
      <AssignmentSubmissionsModal
        assignment={{ assignment_id: 7, title: "HW1" }}
        onClose={vi.fn()}
      />
    );

    // Table renders with our student
    expect(await screen.findByText(/Submissions for "HW1"/i)).toBeInTheDocument();
    expect(await screen.findByText("Alice")).toBeInTheDocument();

    // Open Grade modal
    await userEvent.click(screen.getByRole("button", { name: /grade/i }));

    // Fill by placeholders
    const gradeInput = screen.getByPlaceholderText(/enter numeric grade/i);
    const feedbackTextarea = screen.getByPlaceholderText(/write feedback here/i);

    await userEvent.type(gradeInput, "90");
    await userEvent.type(feedbackTextarea, "Good job");

    // Save
    await userEvent.click(screen.getByRole("button", { name: /save grade/i }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/submissions/42/grade",
        expect.objectContaining({ grade: 90, feedback: "Good job" })
      )
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2)); // refresh
  });
});
