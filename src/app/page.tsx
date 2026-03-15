"use client";

import { useEffect, useState } from "react";
import { GankRequest, Role } from "@/lib/types";
import MapView from "@/components/MapView";
import StatusBadge from "@/components/StatusBadge";
import NewGameButton from "@/components/NewGameButton";
import Link from "next/link";

const roleConfig: Record<Role, { label: string; color: string; dot: string }> = {
  top: { label: "Top", color: "text-red-600", dot: "bg-red-500" },
  mid: { label: "Mid", color: "text-purple-600", dot: "bg-purple-500" },
  bot: { label: "Bot - ADC", color: "text-blue-600", dot: "bg-blue-500" },
  support: { label: "Bot - Support", color: "text-green-600", dot: "bg-green-500" },
};

export default function Home() {
  const [requests, setRequests] = useState<GankRequest[]>([]);
  const [requesting, setRequesting] = useState(false);
  const [lastRequested, setLastRequested] = useState<string | null>(null);

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

  async function handleRequestGank(role: Role) {
    if (requesting) return;
    setRequesting(true);
    setLastRequested(role);
    try {
      const res = await fetch("/api/gank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const newReq = await res.json();
        setRequests((prev) => [...prev, newReq]);
      }
    } finally {
      setRequesting(false);
      setTimeout(() => setLastRequested(null), 1500);
    }
  }

  const pending = requests.filter((r) => r.status === "pending");
  const responded = requests.filter((r) => r.status !== "pending");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-surface-raised px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-text">
            Gank Requester
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/jungler"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text"
            >
              Jungler View
            </Link>
            <NewGameButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex max-w-6xl flex-col gap-8 p-6 lg:flex-row lg:gap-10">
        {/* Map section */}
        <div className="flex flex-col items-center gap-4 lg:flex-1">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-text">
              Click a lane to request a gank
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Your jungler will see the request instantly
            </p>
          </div>
          <MapView onRequestGank={handleRequestGank} disabled={requesting} />
          {lastRequested && (
            <div className="animate-fade-in rounded-lg border border-accent-light bg-accent-light/50 px-4 py-2 text-sm font-medium text-accent">
              Gank requested for {lastRequested.toUpperCase()}!
            </div>
          )}
        </div>

        {/* Queue section */}
        <div className="lg:w-[360px]">
          <div className="rounded-xl border border-border bg-surface-raised p-5">
            <h2 className="mb-4 text-base font-semibold text-text">
              Gank Queue
              {pending.length > 0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  {pending.length}
                </span>
              )}
            </h2>

            {pending.length === 0 && responded.length === 0 ? (
              <div className="py-8 text-center text-sm text-text-muted">
                No gank requests yet.
                <br />
                Click a lane on the map to get started.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Pending requests */}
                {pending.map((req) => (
                  <RequestRow key={req.id} request={req} />
                ))}

                {/* Divider */}
                {pending.length > 0 && responded.length > 0 && (
                  <div className="my-2 border-t border-border" />
                )}

                {/* Responded requests */}
                {[...responded].reverse().map((req) => (
                  <RequestRow key={req.id} request={req} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function RequestRow({ request }: { request: GankRequest }) {
  const config = roleConfig[request.role];
  const timeAgo = Math.round((Date.now() - request.createdAt) / 1000);
  const timeLabel =
    timeAgo < 60 ? `${timeAgo}s` : `${Math.round(timeAgo / 60)}m`;

  return (
    <div
      className={`rounded-lg border p-3 transition-all ${
        request.status === "pending"
          ? "border-amber-200 bg-amber-50/50"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${config.dot}`} />
          <span className={`text-sm font-semibold ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={request.status} />
          <span className="text-xs text-text-muted">{timeLabel}</span>
        </div>
      </div>
      {request.status === "rejected" && request.reason && (
        <p className="mt-2 rounded bg-red-50 px-2.5 py-1.5 text-xs italic text-red-600">
          &ldquo;{request.reason}&rdquo;
        </p>
      )}
      {request.status === "accepted" && (
        <p className="mt-2 text-xs font-medium text-green-600">
          Jungler is on the way!
        </p>
      )}
    </div>
  );
}
