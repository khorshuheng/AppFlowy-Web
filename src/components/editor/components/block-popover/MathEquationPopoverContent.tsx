import { YjsEditor } from '@/application/slate-yjs';
import { CustomEditor } from '@/application/slate-yjs/command';
import { MathEquationBlockData } from '@/application/types';
import { MathEquationNode } from '@/components/editor/editor.type';
import { Button, TextField } from '@mui/material';
import { debounce } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NodeEntry } from 'slate';
import { useSlateStatic } from 'slate-react';
import { findSlateEntryByBlockId } from '@/application/slate-yjs/utils/editor';

function MathEquationPopoverContent({
  blockId,
  onClose,
}: {
  blockId: string;
  onClose: () => void;
}) {
  const editor = useSlateStatic() as YjsEditor;
  const [formula, setFormula] = React.useState('');
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = useCallback((formula: string) => {
    CustomEditor.setBlockData(editor, blockId, {
      formula,
    } as MathEquationBlockData);
    handleClose();
  }, [blockId, handleClose, editor]);

  const debounceSave = useMemo(() => {
    return debounce((formula: string) => {
      CustomEditor.setBlockData(editor, blockId, {
        formula,
      } as MathEquationBlockData);
    }, 300);
  }, [blockId, editor]);

  useEffect(() => {
    const entry = findSlateEntryByBlockId(editor, blockId) as NodeEntry<MathEquationNode>;

    if (!entry) {
      console.error('Block not found');
      return;
    }

    const [node] = entry;

    setFormula(node.data?.formula || '');
  }, [blockId, editor]);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div className={'flex flex-col p-4 gap-3 w-[560px] max-w-[964px]'}>
      <TextField
        inputRef={(input: HTMLTextAreaElement) => {
          if (!input) return;
          if (!inputRef.current) {
            setTimeout(() => {
              input.setSelectionRange(0, input.value.length);
            }, 50);
            inputRef.current = input;
          }

        }}
        rows={4}
        multiline
        fullWidth
        autoFocus={true}
        value={formula}
        onChange={(e) => {
          setFormula(e.target.value);
          debounceSave(e.target.value);
        }}
        placeholder={`E.g. x^2 + y^2 = z^2`}
        autoComplete={'off'}
        spellCheck={false}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave(formula);
          }
        }}
      />
      <div className={'flex justify-end gap-2'}>
        <Button
          size={'small'}
          variant={'outlined'}
          color={'inherit'}
          onClick={handleClose}
        >{t('button.cancel')}</Button>
        <Button
          size={'small'}
          variant={'contained'}
          color={'primary'}
          onClick={() => handleSave(formula)}
        >{t('button.save')}</Button>
      </div>
    </div>
  );
}

export default MathEquationPopoverContent;