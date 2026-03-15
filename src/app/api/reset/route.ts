import { NextRequest, NextResponse } from "next/server";
import { resetState } from "@/lib/state";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.password !== "password") {
    return NextResponse.json({ error: "Wrong password" }, { status: 403 });
  }

  resetState();
  return NextResponse.json({ success: true });
}
