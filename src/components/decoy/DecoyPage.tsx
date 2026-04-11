interface Note {
  id: string;
  title: string;
  preview: string;
  date: string;
}

const NOTES: Note[] = [
  {
    id: "1",
    title: "Grocery list",
    preview: "milk, eggs, bread, spinach, olive oil, garlic…",
    date: "Today",
  },
  {
    id: "2",
    title: "Book recommendations",
    preview: "The Pragmatic Programmer, Deep Work, Atomic Habits",
    date: "Yesterday",
  },
  {
    id: "3",
    title: "Weekend ideas",
    preview: "hike at the reservoir, try the new ramen place, finish…",
    date: "Apr 8",
  },
  {
    id: "4",
    title: "Work ideas",
    preview: "revisit the onboarding flow, automate weekly report…",
    date: "Apr 5",
  },
  {
    id: "5",
    title: "Apartment to-dos",
    preview: "replace kitchen bulb, water plants, call landlord",
    date: "Apr 2",
  },
  {
    id: "6",
    title: "Birthday gift ideas",
    preview: "mom — scarf? dad — that coffee grinder he mentioned",
    date: "Mar 28",
  },
];

export default function DecoyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 px-5 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
        <p className="text-sm text-gray-500 mt-0.5">{NOTES.length} notes</p>
      </header>

      <ul className="divide-y divide-gray-100 px-2">
        {NOTES.map((note) => (
          <li
            key={note.id}
            className="px-3 py-4 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-gray-900 truncate">
                  {note.title}
                </h2>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {note.preview}
                </p>
              </div>
              <span className="text-xs text-gray-400 shrink-0 mt-1">
                {note.date}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-yellow-400 text-gray-900 text-3xl shadow-lg flex items-center justify-center"
        aria-label="New note"
      >
        +
      </button>
    </div>
  );
}
