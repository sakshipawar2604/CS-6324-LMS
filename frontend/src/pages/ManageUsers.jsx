import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";
import AddUserModal from "../components/AddUserModal";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">Manage Users</h1>
          <p className="text-gray-500 text-sm">
            View, add, and manage teachers & students
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          aria-label="Add new user"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          + Add User
        </button>
      </header>

      {/* Users Table */}
      {loading ? (
        <p
          className="text-gray-500 animate-pulse"
          role="status"
          aria-live="polite"
        >
          Loading users...
        </p>
      ) : users.length === 0 ? (
        <p className="text-gray-400 italic" role="status">
          No users found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="min-w-full bg-white shadow rounded-lg overflow-hidden"
            aria-label="Users table"
          >
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th scope="col" className="py-3 px-4 text-left">
                  Name
                </th>
                <th scope="col" className="py-3 px-4 text-left">
                  Email
                </th>
                <th scope="col" className="py-3 px-4 text-left">
                  Role
                </th>
                <th scope="col" className="py-3 px-4 text-left">
                  Joined On
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-indigo-50">
                  <td className="py-2 px-4">{u.name}</td>
                  <td className="py-2 px-4">{u.email}</td>
                  <td className="py-2 px-4">{u.role}</td>
                  <td className="py-2 px-4">{u.joined_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
