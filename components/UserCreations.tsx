// components/UserCreations.tsx
'use client';
interface UserCreation {
  id: number;
  name: string;
  description: string;
  code: string;
}

interface UserCreationsProps {
  creations: UserCreation[];
  onPlay: (code: string) => void;
}

export default function UserCreations({ creations, onPlay }: UserCreationsProps) {
  if (creations.length === 0) {
    return <p className="text-blue-600">No user creations yet. Save a game to get started!</p>;
  }

  return (
    <div className="space-y-4">
      {creations.map((creation) => (
        <div
          key={creation.id}
          className="p-4 border rounded hover:shadow transition cursor-pointer flex justify-between items-center"
        >
          <div>
            <h3 className="text-xl font-bold text-blue-800">{creation.name}</h3>
            <p className="text-blue-700">{creation.description}</p>
          </div>
          <button
            onClick={() => onPlay(creation.code)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Play
          </button>
        </div>
      ))}
    </div>
  );
}