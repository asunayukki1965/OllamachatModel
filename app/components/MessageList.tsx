"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/types";
import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
}

export default function MessageList({ messages, isStreaming, error }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isStreaming]);

  if (messages.length === 0 && !error) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>This file is empty.</p>
        <p className={styles.emptyBody}>
          Send a message and it'll be relayed to your llamafile server as an
          OpenAI-style chat completion request.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {messages.map((m) => (
        <MessageRow key={m.id} message={m} />
      ))}
      {error && (
        <div className={styles.errorRow}>
          <span className={styles.errorLabel}>connection error</span>
          <p>{error}</p>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageRow({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className={styles.userRow}>
        <div className={styles.userLine}>
          <span className={styles.prompt}>&gt;</span> {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.assistantRow}>
      <div className={styles.ticket}>
        <div className={styles.ticketBody}>{message.content || "…"}</div>
      </div>
    </div>
  );
}
