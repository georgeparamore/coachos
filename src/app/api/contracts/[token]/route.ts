import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

function clientIpFrom(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
}

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("id, client_name, contract_type, value_cents, body, status, signer_name, signed_at")
    .eq("sign_token", token)
    .single();

  if (error || !contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (contract.status === "sent") {
    await supabase
      .from("contracts")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("sign_token", token);
    contract.status = "viewed";
  }

  return NextResponse.json({ contract });
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { signerName } = (await request.json()) as { signerName: string };

  if (!signerName?.trim()) {
    return NextResponse.json({ error: "Signature name is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("contracts")
    .select("status")
    .eq("sign_token", token)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }
  if (existing.status === "signed") {
    return NextResponse.json({ error: "This contract has already been signed" }, { status: 409 });
  }

  const { error } = await supabase
    .from("contracts")
    .update({
      status: "signed",
      signer_name: signerName.trim(),
      signed_at: new Date().toISOString(),
      signer_ip: clientIpFrom(request),
      signer_user_agent: request.headers.get("user-agent"),
    })
    .eq("sign_token", token);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
