import React, { useEffect, useRef } from 'react';
import { cn } from '../features/editor/PageCard';

interface RichTextEditorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange, className, style, ...props }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isUpdating = useRef(false);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value && !isUpdating.current) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (ref.current) {
      isUpdating.current = true;
      onChange(ref.current.innerHTML);
      // Reset the updating flag after a short delay so external updates can sync back
      setTimeout(() => {
        isUpdating.current = false;
      }, 0);
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      onInput={handleInput}
      onBlur={handleInput}
      className={cn("whitespace-pre-wrap break-words outline-none", className)}
      style={style}
      {...props}
    />
  );
}
