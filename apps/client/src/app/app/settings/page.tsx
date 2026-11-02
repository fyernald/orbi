"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("18:00");

  return (
    <main style={{ maxWidth: 600, margin: "60px auto", padding: 24, fontFamily: "Arial" }}>
      <h1>Study Reminder Settings</h1>
      <p>Choose when to receive your daily study reminder.</p>

      <section style={{ border: "1px solid #ccc", borderRadius: 12, padding: 24 }}>
        <h2>Daily Email Reminder</h2>

        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enable daily study reminders
        </label>

        <div style={{ marginTop: 24 }}>
          <label htmlFor="reminder-time">Reminder time</label>
          <br />
          <input
            id="reminder-time"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            disabled={!enabled}
            style={{ marginTop: 8, padding: 8 }}
          />
        </div>

        <button
          type="button"
          onClick={() => alert(`Reminder: ${enabled ? "ON" : "OFF"} at ${reminderTime}`)}
          style={{
            marginTop: 24,
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Test Settings
        </button>
      </section>
    </main>
  );
}

