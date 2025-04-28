// components/GameRenderer.tsx
'use client';
import React from 'react';

interface GameRendererProps {
  gameCode: string;
}

export default function GameRenderer({ gameCode }: GameRendererProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Render the generated HTML in an iframe */}
      <iframe
        srcDoc={gameCode}
        title="Generated Game"
        className="w-full h-96 border rounded shadow-md"
      />
      <div className="w-full">
        <h3 className="text-blue-800 font-bold mb-2">Generated Code</h3>
        <pre className="bg-blue-100 p-4 rounded text-xs overflow-auto">
          {gameCode}
        </pre>
      </div>
    </div>
  );
}