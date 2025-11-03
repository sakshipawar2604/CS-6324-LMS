export default function CourseTabs({ tab, setTab }) {
  const tabs = [
    "overview",
    "assignments",
    "resources",
    "students",
    "performance",
  ];
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            tab === t
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-gray-500 hover:text-indigo-600"
          }`}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
