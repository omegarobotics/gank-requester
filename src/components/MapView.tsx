"use client";

import { useEffect, useRef, useState } from "react";
import { Role } from "@/lib/types";

interface Lane {
  id: "top" | "mid" | "bot";
  label: string;
  path: string;
  labelX: number;
  labelY: number;
  color: string;
  hoverColor: string;
}

const lanes: Lane[] = [
  {
    id: "top",
    label: "TOP",
    path: "M 10 10 L 280 10 L 280 55 L 55 55 L 55 280 L 10 280 Z",
    labelX: 55,
    labelY: 150,
    color: "rgba(239,68,68,0.06)",
    hoverColor: "rgba(239,68,68,0.2)",
  },
  {
    id: "mid",
    label: "MID",
    // Centered on the diagonal line from (55,355) to (345,45)
    // Line center is (200,200), perpendicular offset ~25px each side
    path: "M 115 240 L 230 115 L 285 160 L 170 285 Z",
    labelX: 200,
    labelY: 200,
    color: "rgba(168,85,247,0.06)",
    hoverColor: "rgba(168,85,247,0.2)",
  },
  {
    id: "bot",
    label: "BOT",
    path: "M 120 390 L 390 390 L 390 120 L 345 120 L 345 345 L 120 345 Z",
    labelX: 345,
    labelY: 250,
    color: "rgba(59,130,246,0.06)",
    hoverColor: "rgba(59,130,246,0.2)",
  },
];

export default function MapView({
  onRequestGank,
  disabled,
}: {
  onRequestGank: (role: Role) => void;
  disabled: boolean;
}) {
  const [hoveredLane, setHoveredLane] = useState<Lane["id"] | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    if (contextMenu) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [contextMenu]);

  function handleLaneClick(laneId: Lane["id"], e: React.MouseEvent) {
    if (disabled) return;

    if (laneId === "top" || laneId === "mid") {
      onRequestGank(laneId);
      return;
    }

    // Bot lane — show context menu at click position
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  function handleContextSelect(role: Role) {
    setContextMenu(null);
    onRequestGank(role);
  }

  return (
    <div ref={containerRef} className="relative aspect-square w-full max-w-[480px]">
      <svg viewBox="0 0 400 400" className="h-full w-full drop-shadow-lg">
        {/* Background */}
        <rect x="0" y="0" width="400" height="400" rx="20" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />

        {/* Lane paths (visual) */}
        {/* Top lane */}
        <path
          d="M 50 380 L 10 380 Q 5 380 5 375 L 5 25 Q 5 20 10 20 L 340 20"
          fill="none" stroke="#e5e7eb" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Bot lane */}
        <path
          d="M 60 380 L 375 380 Q 380 380 380 375 L 380 60"
          fill="none" stroke="#e5e7eb" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Mid lane */}
        <line x1="55" y1="355" x2="345" y2="45" stroke="#e5e7eb" strokeWidth="30" strokeLinecap="round" />

        {/* Blue base */}
        <rect x="12" y="345" width="45" height="45" rx="10" fill="#bfdbfe" />
        <text x="34" y="372" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="700" letterSpacing="0.5">BLUE</text>

        {/* Red base */}
        <rect x="343" y="12" width="45" height="45" rx="10" fill="#fecaca" />
        <text x="365" y="39" textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="700" letterSpacing="0.5">RED</text>

        {/* Jungle icons */}
        <text x="120" y="155" fontSize="20" opacity="0.15">🌿</text>
        <text x="260" y="275" fontSize="20" opacity="0.15">🌿</text>

        {/* Clickable lane zones */}
        {lanes.map((lane) => (
          <g
            key={lane.id}
            className="cursor-pointer"
            onClick={(e) => handleLaneClick(lane.id, e)}
            onMouseEnter={() => setHoveredLane(lane.id)}
            onMouseLeave={() => setHoveredLane(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !disabled) {
                if (lane.id === "bot") {
                  // Can't easily position context menu from keyboard, just default to bot
                  onRequestGank("bot");
                } else {
                  onRequestGank(lane.id);
                }
              }
            }}
          >
            <path
              d={lane.path}
              fill={hoveredLane === lane.id ? lane.hoverColor : lane.color}
              className="transition-all duration-150"
            />
            <text
              x={lane.labelX}
              y={lane.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="13"
              fontWeight="800"
              fill={hoveredLane === lane.id ? "#1e293b" : "#94a3b8"}
              className="pointer-events-none select-none transition-all duration-150"
              letterSpacing="2"
            >
              {lane.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Hover tooltip */}
      {hoveredLane && !contextMenu && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-text shadow-md">
          Click to request gank — {hoveredLane.toUpperCase()}
        </div>
      )}

      {/* Bot lane context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="absolute z-10 overflow-hidden rounded-lg border border-border bg-white shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y, transform: "translate(-50%, -100%) translateY(-8px)" }}
        >
          <button
            onClick={() => handleContextSelect("bot")}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-blue-50"
          >
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            ADC
          </button>
          <div className="border-t border-border" />
          <button
            onClick={() => handleContextSelect("support")}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-green-50"
          >
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Support
          </button>
        </div>
      )}
    </div>
  );
}
