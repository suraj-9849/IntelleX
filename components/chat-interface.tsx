import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MessageCircle, X } from 'lucide-react';
import type { Timestamp } from '@/app/types';

interface Message {
  content: string;
  role: 'user' | 'assistant';
}

interface ChatInterfaceProps {
  timestamps: Timestamp[];
  className?: string;
}

export default function ChatInterface({
  timestamps,
  className = '',
}: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { content: input, role: 'user' as const };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          events: timestamps,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error.message || 'Failed to process your message. Please try again.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 rounded-full bg-purple-600 p-4 shadow-lg hover:bg-purple-700 ${className}`}
      >
        <MessageCircle className='h-6 w-6' />
      </Button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex h-[500px] w-96 flex-col rounded-lg border border-zinc-800 bg-zinc-900/95 shadow-xl backdrop-blur-sm ${className}`}
    >
      <div className='flex items-center justify-between border-b border-zinc-800 bg-zinc-900 p-4'>
        <h3 className='font-semibold text-white'>Intellex Assistance</h3>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsOpen(false)}
          className='h-8 w-8 rounded-full hover:bg-zinc-800'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>

      <div className='flex-1 space-y-4 overflow-y-auto p-4'>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-200'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className='flex justify-start'>
            <div className='rounded-lg bg-zinc-800 px-4 py-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className='border-t border-zinc-800 bg-zinc-900 p-4'
      >
        <div className='flex gap-2'>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type a message...'
            className='flex-1 border-zinc-700 bg-zinc-800 text-white'
            disabled={isLoading}
          />
          <Button
            type='submit'
            disabled={isLoading}
            className='bg-purple-600 hover:bg-purple-700'
          >
            {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
}
