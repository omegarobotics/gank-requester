import { NextRequest, NextResponse } from "next/server";
import { getRequests, getNextId } from "@/lib/state";
import { Role } from "@/lib/types";

const VALID_ROLES: Role[] = ["top", "mid", "bot", "support"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const role = body.role as Role;

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const requests = getRequests();
  const newRequest = {
    id: getNextId(),
    role,
    status: "pending" as const,
    createdAt: Date.now(),
  };
  requests.push(newRequest);

  return NextResponse.json(newRequest, { status: 201 });
}
