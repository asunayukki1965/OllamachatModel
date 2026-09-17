"use client";

import { useState } from "react";
import styles from "./SettingsPopover.module.css";

interface SettingsPopoverProps {
  model: string;
  temperature: number;
  onChange: (settings: { model: string; temperature: number }) => void;
}

export default function SettingsPopover({ model, temperature, onChange }: SettingsPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Request settings"
      >
        ⚙
      </button>

      {open && (
        <div className={styles.panel}>
          <label className={styles.field}>
            <span>model</span>
            <input
              className={styles.input}
              value={model}
              onChange={(e) => onChange({ model: e.target.value, temperature })}
              placeholder="e.g. gpt-3.5-turbo (most llamafiles ignore this)"
            />
          </label>

          <label className={styles.field}>
            <span>temperature: {temperature.toFixed(1)}</span>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.1}
              value={temperature}
              onChange={(e) => onChange({ model, temperature: Number(e.target.value) })}
            />
          </label>

          <p className={styles.note}>
            The server address is set once via <code>LLAMAFILE_URL</code> in your
            environment, not here — see the README.
          </p>
        </div>
      )}
    </div>
  );
}
