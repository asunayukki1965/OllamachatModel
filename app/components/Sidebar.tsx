"use client";

import { ChatSession } from "@/lib/types";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export default function Sidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>▣</span>
        <div>
          <div className={styles.brandName}>llamafile.chat</div>
          <div className={styles.brandSub}>single-file, local-first</div>
        </div>
      </div>

      <button className={styles.newFile} onClick={onNew}>
        <span>+ new file</span>
      </button>

      <nav className={styles.fileList} aria-label="Conversations">
        {sessions.length === 0 && (
          <p className={styles.empty}>No files yet. Start one above.</p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`${styles.fileTab} ${s.id === activeId ? styles.fileTabActive : ""}`}
          >
            <button className={styles.fileButton} onClick={() => onSelect(s.id)}>
              <span className={styles.fileName}>{s.title}</span>
              <span className={styles.fileExt}>.chat</span>
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => onDelete(s.id)}
              aria-label={`Delete ${s.title}`}
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <a
          href="https://github.com/mozilla-ai/llamafile"
          target="_blank"
          rel="noreferrer"
          className={styles.footerLink}
        >
          mozilla-ai/llamafile ↗
        </a>
      </div>
    </aside>
  );
}
