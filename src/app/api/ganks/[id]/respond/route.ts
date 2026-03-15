import { NextRequest, NextResponse } from "next/server";
import { getRequests } from "@/lib/state";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { action, reason } = body;

  if (action !== "accept" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const requests = getRequests();
  const request = requests.find((r) => r.id === id);

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.status !== "pending") {
    return NextResponse.json(
      { error: "Request already responded to" },
      { status: 400 }
    );
  }

  request.status = action === "accept" ? "accepted" : "rejected";
  if (action === "reject" && reason) {
    request.reason = reason;
  }

  return NextResponse.json(request);
}
