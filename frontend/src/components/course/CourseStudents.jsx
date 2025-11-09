export default function CourseStudents({ students }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-indigo-600 mb-3">
        Enrolled Students
      </h2>
      {students.length === 0 ? (
        <p className="text-gray-500 italic">No students enrolled yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.userId || s.student_id}
                  className="border-b hover:bg-indigo-50"
                >
                  <td className="py-2 px-3">{s.fullName || s.name}</td>
                  <td className="py-2 px-3">{s.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
