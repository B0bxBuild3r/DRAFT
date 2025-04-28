'use client';

import { useChat, Message } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';

interface GameError {
  message: string;
  timestamp: number;
}

interface IframeProps {
  content: string;
  onError: (error: GameError) => void;
}

const   GameIframe: React.FC<IframeProps> = ({ content, onError }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();

        iframe.contentWindow!.onerror = (
          event: Event | string,
          source?: string,
          lineno?: number,
          colno?: number,
          error?: Error
        ) => {
          const errorMessage = error?.message || (typeof event === 'string' ? event : 'Unknown error');
          onError({
            message: `Error: ${errorMessage}${lineno ? `\nLine: ${lineno}` : ''}${colno ? `\nColumn: ${colno}` : ''}`,
            timestamp: Date.now()
          });
          return false;
        };
      }
    }
  }, [content, onError]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full rounded-lg bg-white"
      title="game-preview"
    />
  );
};

export default function Page() {
  const [isAiResponseComplete, setIsAiResponseComplete] = useState(false);
  const [code, setCode] = useState('');
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading
  } = useChat({
    onFinish: (message) => {
      if (message.content.includes('<!DOCTYPE html>') &&
        message.content.includes('</html>')) {
        setIsAiResponseComplete(true);
        setCode(message.content)
      }
    }
  });

  const [gameError, setGameError] = useState<GameError | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Reset completion state when starting new generation
  useEffect(() => {
    if (isLoading) {
      setCode('')
      setIsAiResponseComplete(false);
    }
  }, [isLoading]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleGameError = (error: GameError) => {
    setGameError(error);
    setInput(`Fix this error in the game code:\n${error.message}`);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGameError(null);
    try {
      await handleSubmit(e);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Chat */}
      <div className="w-1/2 flex flex-col border-r border-gray-200">
        <div className="p-4 bg-white border-b">
          <h1 className="text-xl font-bold text-gray-800">Game Generator Chat</h1>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message: Message) => (
            <div
              key={message.id}
              className={`${message.role === 'user'
                  ? 'bg-blue-100 ml-8'
                  : 'bg-white mr-8'
                } p-4 rounded-lg shadow`}
            >
              <div className="font-semibold text-gray-800 mb-2">
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                {message.content}
              </pre>
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {gameError && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <div className="flex items-center text-red-800 mb-2">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Game Error Detected</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              An error message has been prepared. Click Submit to get it fixed.
            </p>
          </div>
        )}

        {/* Input Form */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              name="prompt"
              value={input}
              onChange={handleInputChange}
              placeholder="Describe your game or ask for changes..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {isLoading ? 'Generating...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel - Game Preview */}
      <div className="w-1/2 flex flex-col bg-gray-50">
        <div className="p-4 bg-white border-b">
          <h1 className="text-xl font-bold text-gray-800">Game Preview</h1>
        </div>
        <div className="flex-1 p-4">
          {isAiResponseComplete ? (
            <div className="h-full rounded-lg overflow-hidden shadow-lg">
              <GameIframe
                content={code}
                onError={handleGameError}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              {isLoading
                ? "Generating your game..."
                : !isAiResponseComplete
                  ? "Describe your game to get started"
                  : "Finalizing game code..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
