import { useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

export default function AddUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", role: "Student" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/users/add", form);
      toast.success("User added successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2
          id="modal-title"
          className="text-xl font-semibold text-indigo-700 mb-4"
        >
          Add New User
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Add user form"
        >
          <div>
            <label
              htmlFor="user-name"
              className="block text-sm font-medium text-gray-600"
            >
              Full Name{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              id="user-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              aria-required="true"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="user-email"
              className="block text-sm font-medium text-gray-600"
            >
              Email{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              id="user-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              aria-required="true"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="user-role"
              className="block text-sm font-medium text-gray-600"
            >
              Role
            </label>
            <select
              id="user-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              aria-required="true"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
            >
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              {loading ? "Adding..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
