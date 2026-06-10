import React, { useEffect, useRef } from 'react';

export function AutoResizeTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [props.value, props.style]);

  return <textarea ref={ref} {...props} style={{...props.style, overflow: 'hidden'}} />;
}
