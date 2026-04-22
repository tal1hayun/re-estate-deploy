'use client';

import { useState, useRef, KeyboardEvent } from 'react';

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
};

export default function TagInput({
  tags,
  onChange,
  suggestions = [],
  placeholder = 'הוסף תגית...',
  disabled = false,
}: Props) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  function addTag(tag: string) {
    const trimmed = tag.replace(/,+$/, '').trim();
    if (!trimmed || tags.includes(trimmed)) {
      setInput('');
      return;
    }
    onChange([...tags, trimmed]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(tags.filter(t => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
      return;
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          padding: '8px 12px',
          background: 'var(--color-surface)',
          border: `1px solid ${focused ? 'rgba(46,168,223,0.5)' : 'var(--color-border)'}`,
          borderRadius: 8,
          cursor: disabled ? 'default' : 'text',
          minHeight: 42,
          alignItems: 'center',
          transition: 'border-color 0.15s',
          direction: 'rtl',
        }}
      >
        {tags.map(tag => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              background: 'rgba(46,168,223,0.1)',
              border: '1px solid rgba(46,168,223,0.22)',
              borderRadius: 20,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-accent)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              lineHeight: 1.6,
            }}
          >
            {tag}
            {!disabled && (
              <button
                onClick={e => { e.stopPropagation(); removeTag(tag); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(46,168,223,0.55)',
                  padding: 0,
                  lineHeight: 1,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={`הסר תגית ${tag}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); if (input.trim()) addTag(input); }}
            placeholder={tags.length === 0 ? placeholder : ''}
            style={{
              flex: '1 1 80px',
              minWidth: 80,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-fg)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'inherit',
              direction: 'rtl',
            }}
          />
        )}
      </div>

      {/* Autocomplete */}
      {focused && input.trim() && filteredSuggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            left: 0,
            zIndex: 20,
            marginTop: 4,
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          {filteredSuggestions.slice(0, 6).map(s => (
            <button
              key={s}
              onMouseDown={e => { e.preventDefault(); addTag(s); }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 14px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-fg)',
                fontSize: 'var(--text-sm)',
                textAlign: 'right',
                fontFamily: 'inherit',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
