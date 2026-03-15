"use client";

export default function NewGameButton() {
  async function handleReset() {
    const password = window.prompt("Enter password to start a new game:");
    if (!password) return;

    const res = await fetch("/api/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = "/";
    } else {
      alert("Wrong password!");
    }
  }

  return (
    <button
      onClick={handleReset}
      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
    >
      New Game
    </button>
  );
}
