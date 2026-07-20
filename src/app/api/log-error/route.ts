import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { context, message, stack, url } = body as {
    context?: string;
    message?: string;
    stack?: string;
    url?: string;
  };

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const service = createServiceClient();
  const { data: row } = await service
    .from("error_logs")
    .insert({
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      context: context || "unknown",
      message,
      stack: stack || null,
      url: url || null,
    })
    .select("id")
    .single();

  return NextResponse.json({ ok: true, id: row?.id ?? null });
}
