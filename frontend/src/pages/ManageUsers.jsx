import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Modal form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    passwordHash: "",
    roleId: "",
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open modal (create or edit)
  const openModal = (user = null) => {
    setSelectedUser(user);
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        passwordHash: user.passwordHash || "",
        roleId: user.role?.roleId || "",
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        passwordHash: "",
        roleId: "",
      });
    }
    setShowModal(true);
  };

  // Create or Update user
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.passwordHash ||
      !formData.roleId
    ) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      passwordHash: formData.passwordHash,
      role: { roleId: Number(formData.roleId) },
    };

    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser.userId}`, payload);
        toast.success("User updated successfully!");
      } else {
        await api.post("/users", payload);
        toast.success("User created successfully!");
      }

      await fetchUsers();

      // Reset and close
      setShowModal(false);
      setSelectedUser(null);
      setFormData({ fullName: "", email: "", passwordHash: "", roleId: "" });
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save user");
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser.userId}`);
      setUsers((prev) => prev.filter((u) => u.userId !== selectedUser.userId));
      toast.success("User deleted successfully!");
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete user");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <p
          className="text-gray-500 animate-pulse"
          role="status"
          aria-live="polite"
        >
          Loading users...
        </p>
      </div>
    );

  return (
    <div>
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">Manage Users</h1>
          <p className="text-gray-500">
            View, create, update, and delete users
          </p>
        </div>
        <button
          onClick={() => openModal(null)}
          aria-label="Add new user"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          + Add User
        </button>
      </header>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table
          className="min-w-full text-left border-collapse"
          aria-label="Users table"
        >
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                Email
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                Role
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                Joined On
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.userId}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => openModal(u)}
                >
                  <td className="px-6 py-3 font-medium">{u.fullName}</td>
                  <td className="px-6 py-3">{u.email}</td>
                  <td className="px-6 py-3">{u.role?.roleName || "—"}</td>
                  <td className="px-6 py-3">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Create / Edit / Delete */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              {selectedUser ? "Edit User" : "Create New User"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="User form"
            >
              <div>
                <label
                  htmlFor="user-fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="user-fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="user-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="user-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password (hash)
                </label>
                <input
                  id="user-password"
                  type="text"
                  value={formData.passwordHash}
                  onChange={(e) =>
                    setFormData({ ...formData, passwordHash: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="user-role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <select
                  id="user-role"
                  value={formData.roleId}
                  onChange={(e) =>
                    setFormData({ ...formData, roleId: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="1">Admin</option>
                  <option value="2">Teacher</option>
                  <option value="3">Student</option>
                </select>
              </div>

              <div className="flex justify-between pt-4">
                {selectedUser && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                  >
                    {selectedUser ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
