"use client";

import { useState } from "react";
import { GankRequest } from "@/lib/types";
import StatusBadge from "./StatusBadge";

const roleLabels: Record<string, { label: string; color: string; dot: string }> = {
  top: { label: "Top", color: "text-red-600", dot: "bg-red-500" },
  mid: { label: "Mid", color: "text-purple-600", dot: "bg-purple-500" },
  bot: { label: "Bot - ADC", color: "text-blue-600", dot: "bg-blue-500" },
  support: { label: "Bot - Support", color: "text-green-600", dot: "bg-green-500" },
};

const rejectionPlaceholders = [
  "skill issue",
  "dragon is more important",
  "my camps are up",
  "you're 0/5, it's over",
  "ward your lane first",
  "I'm farming",
  "just play safe lol",
  "enemy jungler is there",
];

function getRandomPlaceholder() {
  return rejectionPlaceholders[
    Math.floor(Math.random() * rejectionPlaceholders.length)
  ];
}

export default function GankRequestCard({
  request,
  onRespond,
}: {
  request: GankRequest;
  onRespond: (id: string, action: "accept" | "reject", reason?: string) => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [placeholder] = useState(getRandomPlaceholder);

  const config = roleLabels[request.role] ?? {
    label: request.role,
    color: "text-text",
    dot: "bg-text-muted",
  };

  const timeAgo = Math.round((Date.now() - request.createdAt) / 1000);
  const timeLabel =
    timeAgo < 60 ? `${timeAgo}s ago` : `${Math.round(timeAgo / 60)}m ago`;

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
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
          <StatusBadge status={request.status} />
        </div>
        <span className="text-xs text-text-muted">{timeLabel}</span>
      </div>

      {request.status === "pending" && (
        <div className="mt-3 flex flex-col gap-2">
          {showRejectInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={placeholder}
                className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-text placeholder-text-muted focus:border-accent focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onRespond(request.id, "reject", rejectReason || placeholder);
                  }
                }}
                autoFocus
              />
              <button
                onClick={() =>
                  onRespond(request.id, "reject", rejectReason || placeholder)
                }
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Reject
              </button>
              <button
                onClick={() => setShowRejectInput(false)}
                className="rounded-lg px-2 py-1.5 text-sm text-text-muted hover:text-text"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onRespond(request.id, "accept")}
                className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
              >
                On my way!
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                className="flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}

      {request.status === "rejected" && request.reason && (
        <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs italic text-red-600">
          &ldquo;{request.reason}&rdquo;
        </p>
      )}
    </div>
  );
}
