"use client";

import { useEffect, useState } from "react";
import styles from "./StatusPill.module.css";

export default function StatusPill() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [target, setTarget] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setOnline(data.online);
          setTarget(data.target || "");
        }
      } catch {
        if (!cancelled) setOnline(false);
      }
    }

    check();
    const interval = setInterval(check, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const label =
    online === null ? "checking…" : online ? "connected" : "unreachable";

  return (
    <div className={styles.pill} title={target || undefined}>
      <span
        className={`${styles.dot} ${
          online === null ? styles.dotPending : online ? styles.dotOn : styles.dotOff
        }`}
      />
      <span className={styles.label}>{label}</span>
      {target && <span className={styles.target}>{target}</span>}
    </div>
  );
}
