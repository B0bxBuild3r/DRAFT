// components/PromptForm.tsx
'use client';
import { useState } from 'react';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
}

export default function PromptForm({ onSubmit, loading }: PromptFormProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your game prompt..."
        className="border rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
      />
      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Generating...' : 'Generate Game'}
      </button>
    </form>
  );
}