// components/SavedGameForm.tsx
'use client';
import { useState } from 'react';

interface SavedGameFormProps {
  onSave: (name: string, description: string) => void;
}

export default function SavedGameForm({ onSave }: SavedGameFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name, description);
    setName('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Game Name"
        className="border rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Game Description"
        className="border rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Save Game
      </button>
    </form>
  );
}