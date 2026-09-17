"use client";

import { KeyboardEvent, useRef, useState } from "react";
import styles from "./Composer.module.css";

interface ComposerProps {
  onSend: (text: string) => void;
  disabled: boolean;
  onStop?: () => void;
  isStreaming: boolean;
}

export default function Composer({ onSend, disabled, onStop, isStreaming }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.inputRow}>
        <span className={styles.prompt}>&gt;</span>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="Type a message and press Enter to send…"
          value={value}
          rows={1}
          onChange={(e) => {
            setValue(e.target.value);
            autoGrow();
          }}
          onKeyDown={handleKeyDown}
        />
        {isStreaming ? (
          <button className={styles.stopButton} onClick={onStop}>
            stop
          </button>
        ) : (
          <button
            className={styles.sendButton}
            onClick={submit}
            disabled={disabled || !value.trim()}
          >
            send
          </button>
        )}
      </div>
      <p className={styles.hint}>Enter to send · Shift+Enter for a new line</p>
    </div>
  );
}
