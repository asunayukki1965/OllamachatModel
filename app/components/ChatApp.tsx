"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import Composer from "./Composer";
import StatusPill from "./StatusPill";
import SettingsPopover from "./SettingsPopover";
import { ChatMessage, ChatSession } from "@/lib/types";
import { loadSessions, saveSessions, newId, titleFromFirstMessage } from "@/lib/storage";
import { streamChat } from "@/lib/api";
import styles from "./ChatApp.module.css";

function createSession(): ChatSession {
  return {
    id: newId(),
    title: "untitled",
    createdAt: Date.now(),
    messages: [],
  };
}

export default function ChatApp() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState("local-model");
  const [temperature, setTemperature] = useState(0.7);
  const abortRef = useRef<AbortController | null>(null);

  // load persisted sessions once, on mount
  useEffect(() => {
    const stored = loadSessions();
    if (stored.length > 0) {
      setSessions(stored);
      setActiveId(stored[0].id);
    } else {
      const first = createSession();
      setSessions([first]);
      setActiveId(first.id);
    }
  }, []);

  // persist whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) saveSessions(sessions);
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;

  function updateSession(id: string, updater: (s: ChatSession) => ChatSession) {
    setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  }

  function handleNewSession() {
    const fresh = createSession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    setError(null);
  }

  function handleDeleteSession(id: string) {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (id === activeId) {
        setActiveId(next[0]?.id ?? null);
      }
      return next;
    });
  }

  async function handleSend(text: string) {
    if (!activeSession) return;
    setError(null);

    const userMessage: ChatMessage = {
      id: newId(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    const isFirstMessage = activeSession.messages.length === 0;
    const withUser: ChatMessage[] = [...activeSession.messages, userMessage];

    updateSession(activeSession.id, (s) => ({
      ...s,
      title: isFirstMessage ? titleFromFirstMessage(text) : s.title,
      messages: withUser,
    }));

    const assistantMessage: ChatMessage = {
      id: newId(),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };

    updateSession(activeSession.id, (s) => ({
      ...s,
      messages: [...s.messages, assistantMessage],
    }));

    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);

    let accumulated = "";
    try {
      await streamChat({
        messages: withUser,
        model,
        temperature,
        signal: controller.signal,
        onToken: (token) => {
          accumulated += token;
          updateSession(activeSession.id, (s) => ({
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantMessage.id ? { ...m, content: accumulated } : m
            ),
          }));
        },
      });
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setError((err as Error).message);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewSession}
        onDelete={handleDeleteSession}
      />
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {activeSession ? `${activeSession.title}.chat` : "no file open"}
          </div>
          <div className={styles.headerRight}>
            <StatusPill />
            <SettingsPopover
              model={model}
              temperature={temperature}
              onChange={({ model: m, temperature: t }) => {
                setModel(m);
                setTemperature(t);
              }}
            />
          </div>
        </header>

        <div className={styles.body}>
          <MessageList
            messages={activeSession?.messages ?? []}
            isStreaming={isStreaming}
            error={error}
          />
        </div>

        <Composer
          onSend={handleSend}
          disabled={!activeSession || isStreaming}
          isStreaming={isStreaming}
          onStop={handleStop}
        />
      </div>
    </div>
  );
}
