import { getActorSuggestions } from "@/lib/actorSuggestions"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? ""
  const limitParam = request.nextUrl.searchParams.get("limit") ?? "12"
  const limit = Number.parseInt(limitParam, 10)

  const suggestions = await getActorSuggestions(query, Number.isNaN(limit) ? 12 : limit)

  return NextResponse.json({ suggestions })
}
