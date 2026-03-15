import { NextRequest, NextResponse } from "next/server";
import { getRequests } from "@/lib/state";

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");
  let requests = getRequests();

  if (role) {
    requests = requests.filter((r) => r.role === role);
  }

  return NextResponse.json(requests, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
