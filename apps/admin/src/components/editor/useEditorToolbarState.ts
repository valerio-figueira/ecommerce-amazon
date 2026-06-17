'use client';

import type { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';

export function useEditorToolbarState(editor: Editor | null): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const bump = (): void => {
      setTick((current) => current + 1);
    };

    editor.on('selectionUpdate', bump);
    editor.on('transaction', bump);

    return () => {
      editor.off('selectionUpdate', bump);
      editor.off('transaction', bump);
    };
  }, [editor]);

  return tick;
}
