'use client';

import { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommandBlockProps {
  commands: string;
  language?: string;
  onCopy?: () => void;
  className?: string;
}

export function CommandBlock({
  commands,
  language = 'bash',
  onCopy,
  className,
}: CommandBlockProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(commands);
      setHasCopied(true);
      toast.success('Copied to clipboard!');
      onCopy?.();
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = commands;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setHasCopied(true);
      toast.success('Copied to clipboard!');
      onCopy?.();
      setTimeout(() => setHasCopied(false), 2000);
    }
  }, [commands, onCopy]);

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-muted/50 overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b px-3 py-1.5'>
        <span className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
          {language}
        </span>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-6 w-6'
          onClick={handleCopy}
        >
          {hasCopied ? (
            <Check className='size-3 text-green-500' />
          ) : (
            <Copy className='size-3 text-muted-foreground' />
          )}
        </Button>
      </div>

      {/* Code */}
      <pre className='overflow-x-auto p-3 text-sm font-mono leading-relaxed'>
        <code>{commands}</code>
      </pre>
    </div>
  );
}
