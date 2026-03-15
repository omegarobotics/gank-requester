"use client";

import { useEffect, useState } from "react";
import { GankRequest } from "@/lib/types";
import GankRequestCard from "@/components/GankRequestCard";
import NewGameButton from "@/components/NewGameButton";
import Link from "next/link";

export default function JunglerPage() {
  const [requests, setRequests] = useState<GankRequest[]>([]);

  useEffect(() => {
    function fetchRequests() {
      fetch("/api/ganks")
        .then((r) => r.json())
        .then(setRequests)
        .catch(() => {});
    }

    fetchRequests();
    const interval = setInterval(fetchRequests, 2000);
    return () => clearInterval(interval);
  }, []);

  async function handleRespond(
    id: string,
    action: "accept" | "reject",
    reason?: string
  ) {
    const res = await fetch(`/api/ganks/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });

    if (res.ok) {
      const updated = await res.json();
      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    }
  }

  const pending = requests.filter((r) => r.status === "pending");
  const responded = requests.filter((r) => r.status !== "pending");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-surface-raised px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              &larr; Map
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-text">
              Jungler Dashboard
            </h1>
          </div>
          <NewGameButton />
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-6">
        {/* Pending */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-text">
            Pending Requests
            {pending.length > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                {pending.length}
              </span>
            )}
          </h2>
          {pending.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface-raised py-10 text-center text-sm text-text-muted">
              No pending requests. Farm in peace.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pending.map((req) => (
                <GankRequestCard
                  key={req.id}
                  request={req}
                  onRespond={handleRespond}
                />
              ))}
            </div>
          )}
        </section>

        {/* History */}
        {responded.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-base font-semibold text-text-secondary">
              History
            </h2>
            <div className="flex flex-col gap-3">
              {[...responded].reverse().map((req) => (
                <GankRequestCard
                  key={req.id}
                  request={req}
                  onRespond={handleRespond}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
